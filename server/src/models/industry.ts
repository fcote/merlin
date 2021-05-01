import { JSONSchema } from 'objection'
import { ObjectType, Field } from 'type-graphql'

import { BaseModel } from '@models/base'

@ObjectType('Industry')
class Industry extends BaseModel {
  @Field((_) => String)
  name: string

  static get tableName() {
    return 'industries'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name'],
  }
}

export { Industry }
