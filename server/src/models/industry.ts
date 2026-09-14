import { JSONSchema } from 'objection'

import { BaseModel } from '@models/base'

class Industry extends BaseModel {
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
