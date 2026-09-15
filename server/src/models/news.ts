import { JSONSchema, Model } from 'objection'

import { BaseModel } from '@models/base'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

enum NewsType {
  standard = 'standard',
  pressRelease = 'press-release',
}

class News extends BaseModel {
  date: Date

  type: NewsType

  title: string

  content: string

  website?: string

  url?: string

  securityId?: number | string

  security?: Security

  static get tableName() {
    return 'news'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['date', 'type', 'title', 'content'],
  }

  static get relationMappings() {
    return {
      security: {
        relation: Model.BelongsToOneRelation,
        modelClass: Security,
        join: {
          from: `${this.tableName}.securityId`,
          to: `${Security.tableName}.id`,
        },
      },
    }
  }
}

class PaginatedNews extends PaginatedClass(News) {}

export { News, NewsType, PaginatedNews }
