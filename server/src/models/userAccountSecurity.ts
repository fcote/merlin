import { GraphQLDateTime } from 'graphql-scalars'
import { JSONSchema, Model, Transaction } from 'objection'
import { ObjectType, Field, Float, ID } from 'type-graphql'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { Security } from '@models/security'
import { UserAccount } from '@models/userAccount'
import { PaginatedClass } from '@resolvers/paginated'
import {
  ApolloResourceNotFound,
  ApolloForbidden,
} from '@typings/errors/apolloErrors'

@ObjectType('UserAccountSecurity')
class UserAccountSecurity extends SoftDeleteModel {
  @Field((_) => String)
  name: string
  @Field((_) => Float)
  volume: number
  @Field((_) => Float)
  openPrice: number
  @Field((_) => String)
  currency: string
  @Field((_) => GraphQLDateTime)
  openedAt: Date
  @Field((_) => Float, { nullable: true })
  profit: number

  @Field((_) => String, { nullable: true })
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
    required: ['name', 'volume', 'openPrice', 'openedAt', 'userAccountId'],
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

  static checkOwnership = async (
    id: number | string | undefined,
    userId: string | undefined,
    trx?: Transaction
  ) => {
    if (!id) return
    const userAccountSecurity = await UserAccountSecurity.query(trx)
      .findById(id)
      .withGraphFetched('userAccount')
    if (!userAccountSecurity) {
      throw new ApolloResourceNotFound('ACCOUNT_SECURITY_NOT_FOUND')
    }
    if (userAccountSecurity.userAccount.userId !== userId) {
      throw new ApolloForbidden('ACCESS_DENIED')
    }
  }
}

@ObjectType('PaginatedUserAccountSecurity')
class PaginatedUserAccountSecurity extends PaginatedClass(
  UserAccountSecurity
) {}

export { UserAccountSecurity, PaginatedUserAccountSecurity }
