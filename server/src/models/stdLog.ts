import { JSONSchema } from 'objection'

import { BaseModel } from '@models/base'
import { PaginatedClass } from '@resolvers/paginated'

class StdLog extends BaseModel {
  message: string

  level: string

  data: any

  static get tableName() {
    return 'std_logs'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['level', 'message', 'data'],
  }
}

class PaginatedStdLog extends PaginatedClass(StdLog) {}

export { StdLog, PaginatedStdLog }
