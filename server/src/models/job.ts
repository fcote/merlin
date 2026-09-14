import { JSONSchema } from 'objection'

import { BaseModel } from '@models/base'

enum JobType {
  newsSubscribed = 'newsSubscribed',
  earningsSubscribed = 'earningsSubscribed',
  pricesSubscribed = 'pricesSubscribed',
}

class Job extends BaseModel {
  type: JobType

  isRunning: boolean

  static get tableName() {
    return 'jobs'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['type', 'isRunning'],
  }
}

export { Job, JobType }
