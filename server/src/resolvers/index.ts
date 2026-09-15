import { GraphQLScalarType, GraphQLSchema } from 'graphql'
import {
  GraphQLDateTimeISO,
  GraphQLDateTime,
  GraphQLJSON,
  GraphQLLocalDate,
} from 'graphql-scalars'
import { createSchema } from 'graphql-yoga'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fieldResolvers } from './bindings'
import { enumValues } from './enumValues'

const schema: GraphQLSchema = createSchema({
  typeDefs: readFileSync(join(__dirname, 'schema.graphql'), 'utf8'),
  resolvers: {
    ...fieldResolvers,
    ...enumValues,
    DateTime: new GraphQLScalarType({
      ...GraphQLDateTimeISO.toConfig(),
      name: 'DateTime',
      description: GraphQLDateTime.description,
    }),
    JSON: GraphQLJSON,
    LocalDate: GraphQLLocalDate,
  },
})

export { schema }
