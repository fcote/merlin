import { JSONSchema } from 'objection'

import { BaseModel } from '@models/base'

class Sector extends BaseModel {
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
