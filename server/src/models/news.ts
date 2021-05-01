import { GraphQLDateTime } from 'graphql-iso-date'
import { JSONSchema, Model } from 'objection'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { BaseModel } from '@models/base'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

enum NewsType {
  standard = 'standard',
  pressRelease = 'press-release',
}

registerEnumType(NewsType, {
  name: 'NewsType',
})

@ObjectType('News')
class News extends BaseModel {
  @Field((_) => GraphQLDateTime)
  date: Date
  @Field((_) => NewsType)
  type: NewsType
  @Field((_) => String)
  title: string
  @Field((_) => String)
  content: string
  @Field((_) => String, { nullable: true })
  website?: string
  @Field((_) => String, { nullable: true })
  url?: string
  @Field((_) => ID, { nullable: true })
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

@ObjectType('PaginatedNews')
class PaginatedNews extends PaginatedClass(News) {}

export { News, NewsType, PaginatedNews }
