import { JSONSchema, Model, Transaction } from 'objection'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { Security } from '@models/security'
import { UserAccount } from '@models/userAccount'
import { PaginatedClass } from '@resolvers/paginated'
import {
  ApolloResourceNotFound,
  ApolloForbidden,
} from '@typings/errors/apolloErrors'

class UserAccountSecurity extends SoftDeleteModel {
  name: string

  volume: number

  openPrice: number

  currency: string

  openedAt: Date

  profit: number

  externalId: string

  securityId: number | string

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

class PaginatedUserAccountSecurity extends PaginatedClass(
  UserAccountSecurity
) {}

export { UserAccountSecurity, PaginatedUserAccountSecurity }
