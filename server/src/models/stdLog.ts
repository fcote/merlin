import { GraphQLJSON } from 'graphql-scalars'
import { JSONSchema } from 'objection'
import { ObjectType, Field } from 'type-graphql'

import { BaseModel } from '@models/base'
import { PaginatedClass } from '@resolvers/paginated'

@ObjectType('StdLog')
class StdLog extends BaseModel {
  @Field((_) => String)
  message: string
  @Field((_) => String)
  level: string
  @Field((_) => GraphQLJSON)
  data: any

  static get tableName() {
    return 'std_logs'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['level', 'message', 'data'],
  }
}

@ObjectType('PaginatedStdLog')
class PaginatedStdLog extends PaginatedClass(StdLog) {}

export { StdLog, PaginatedStdLog }
