import { JSONSchema } from 'objection'
import { ObjectType, Field } from 'type-graphql'

import { BaseModel } from '@models/base'

@ObjectType('Sector')
class Sector extends BaseModel {
  @Field((_) => String)
  name: string

  static get tableName() {
    return 'sectors'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name'],
  }
}

export { Sector }
