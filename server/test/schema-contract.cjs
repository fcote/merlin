const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const {
  graphql,
  printSchema,
  lexicographicSortSchema,
  validateSchema,
} = require('graphql')
const { createSchema } = require('graphql-yoga')
const { schema } = require('../dist/src/resolvers')
const { fieldResolvers } = require('../dist/src/resolvers/bindings')
const { getRequestedFields } = require('../dist/src/resolvers/fields')
const contract = require('./fixtures/graphql16-contract.json')

// Captured from the executable TypeGraphQL schema at 82f0aaf, before migration.
// Includes field/argument types, defaults, nullability, enums, and descriptions.
test('the complete public schema and stored enum values match the GraphQL 16 API', () => {
  assert.deepEqual(validateSchema(schema), [])
  const sdl = printSchema(lexicographicSortSchema(schema)) + '\n'
  assert.equal(
    createHash('sha256').update(sdl).digest('hex'),
    contract.schemaSha256
  )
  for (const [name, values] of Object.entries(contract.enums)) {
    const type = schema.getType(name)
    for (const [external, internal] of Object.entries(values)) {
      assert.equal(type.parseValue(external), internal)
      assert.equal(type.serialize(internal), external)
    }
  }
})

test('all original resolver bindings exist and protected fields reject missing authentication', async () => {
  assert.equal(
    Object.values(fieldResolvers).reduce(
      (n, fields) => n + Object.keys(fields).length,
      0
    ),
    contract.bindings.length
  )
  for (const { type, field, auth, kind } of contract.bindings) {
    const definition = schema.getType(type).getFields()[field]
    assert.equal(typeof definition.resolve, 'function', `${type}.${field}`)
    if (kind === 'Subscription')
      assert.equal(typeof definition.subscribe, 'function')
    if (auth) {
      await assert.rejects(
        () => definition.resolve({}, {}, {}, {}),
        /ACCESS_DENIED/
      )
      if (kind === 'Subscription') {
        await assert.rejects(
          () => definition.subscribe({}, {}, {}, {}),
          /ACCESS_DENIED/
        )
      }
    }
  }
})

test('database projections honor aliases, fragments, and GraphQL 17 coerced directive variables', async () => {
  let selected
  const projectionSchema = createSchema({
    typeDefs: `type Query { page: Page! } type Page { total: Int!, nodes: [Item!]! } type Item { id: ID!, ticker: String!, secret: String! }`,
    resolvers: {
      Query: {
        page: (_, __, ___, info) => {
          selected = getRequestedFields(info)
          return {
            total: 1,
            nodes: [{ id: '1', ticker: 'TEST', secret: 'value' }],
          }
        },
      },
    },
  })
  for (const show of [true, false]) {
    const result = await graphql({
      schema: projectionSchema,
      source: `query($show: Boolean!, $hide: Boolean!) { page { total entries: nodes { alias: id ...Details secret @skip(if: $hide) } } } fragment Details on Item { ticker @include(if: $show) }`,
      variableValues: { show, hide: true },
    })
    assert.equal(result.errors, undefined)
    assert.deepEqual(selected.sort(), show ? ['id', 'ticker'] : ['id'])
  }
})
