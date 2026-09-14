const { test } = require('node:test')
const assert = require('node:assert/strict')
require('reflect-metadata')
const { graphql, GraphQLSchema, GraphQLObjectType } = require('graphql')
const { schema } = require('../dist/src/resolvers')

// Exercise the scalars registered by Merlin through GraphQL's input/output
// coercion, including TypeGraphQL's Date mapping and explicit scalar fields.
const echoSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'ScalarEcho',
    fields: Object.fromEntries(
      ['DateTime', 'LocalDate', 'JSON'].map((name) => {
        const type = schema.getType(name)
        assert.ok(type, `Missing public scalar ${name}`)
        return [
          name,
          { type, args: { value: { type } }, resolve: (_, { value }) => value },
        ]
      })
    ),
  }),
})

test('public date and JSON scalars preserve variable and literal round trips', async () => {
  const result = await graphql({
    schema: echoSchema,
    source: `query($at: DateTime!, $date: LocalDate!, $data: JSON!) {
      DateTime(value: $at)
      LocalDate(value: $date)
      JSON(value: $data)
      literal: DateTime(value: "2026-09-14T12:30:00+02:00")
      literalDate: LocalDate(value: "2024-02-29")
      literalJSON: JSON(value: {currency: "EUR", values: [1, null, false]})
    }`,
    variableValues: {
      at: '2026-09-14T12:30:00+02:00',
      date: '2024-02-29',
      data: { currency: 'EUR', values: [1, null, false] },
    },
  })
  assert.equal(result.errors, undefined)
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), {
    DateTime: '2026-09-14T10:30:00.000Z',
    LocalDate: '2024-02-29',
    JSON: { currency: 'EUR', values: [1, null, false] },
    literal: '2026-09-14T10:30:00.000Z',
    literalDate: '2024-02-29',
    literalJSON: { currency: 'EUR', values: [1, null, false] },
  })
})

test('invalid dates are rejected before a resolver can run', async () => {
  for (const [type, value] of [
    ['DateTime', 'not-a-date'],
    ['LocalDate', '2025-02-29'],
  ]) {
    const result = await graphql({
      schema: echoSchema,
      source: `query($value: ${type}!) { ${type}(value: $value) }`,
      variableValues: { value },
    })
    assert.ok(result.errors?.length, `${type} accepted ${value}`)
    assert.equal(result.data, undefined)
  }
})
