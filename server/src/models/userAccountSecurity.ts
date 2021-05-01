import { GraphQLDateTime } from 'graphql-iso-date'
import { JSONSchema, Model } from 'objection'
import { ObjectType, Field, Float, ID } from 'type-graphql'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { Security } from '@models/security'
import { UserAccount } from '@models/userAccount'
import { PaginatedClass } from '@resolvers/paginated'

@ObjectType('UserAccountSecurity')
class UserAccountSecurity extends SoftDeleteModel {
  @Field((_) => String)
  name: string
  @Field((_) => Float)
  profit: number
  @Field((_) => Float)
  volume: number
  @Field((_) => Float)
  openPrice: number
  @Field((_) => String, { nullable: true })
  currency: string
  @Field((_) => GraphQLDateTime, { nullable: true })
  openedAt: Date

  @Field((_) => String)
  externalId: string
  @Field((_) => ID)
  securityId: number | string
  @Field((_) => ID)
  userAccountId: number | string

  userAccount: UserAccount

  static get tableName() {
    return 'user_account_securities'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: [
      'name',
      'profit',
      'volume',
      'openPrice',
      'externalId',
      'userAccountId',
    ],
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
      userAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserAccount,
        join: {
          from: `${this.tableName}.userAccountId`,
          to: `${UserAccount.tableName}.id`,
        },
      },
    }
  }
}

@ObjectType('PaginatedUserAccountSecurity')
class PaginatedUserAccountSecurity extends PaginatedClass(
  UserAccountSecurity
) {}

export { UserAccountSecurity, PaginatedUserAccountSecurity }
