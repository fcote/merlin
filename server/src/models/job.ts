import { JSONSchema } from 'objection'
import { ObjectType, Field, registerEnumType } from 'type-graphql'

import { BaseModel } from '@models/base'

enum JobType {
  newsSubscribed = 'newsSubscribed',
  earningsSubscribed = 'earningsSubscribed',
  pricesSubscribed = 'pricesSubscribed',
}

registerEnumType(JobType, {
  name: 'JobType',
})

@ObjectType('Job')
class Job extends BaseModel {
  @Field((_) => JobType)
  type: JobType
  @Field((_) => Boolean)
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
