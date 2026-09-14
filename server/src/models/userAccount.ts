import { JSONSchema, Model, Transaction } from 'objection'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { User } from '@models/user'
import { UserAccountSecurity } from '@models/userAccountSecurity'
import { PaginatedClass } from '@resolvers/paginated'
import { SecurityProvider } from '@services/userAccount/providers'
import { XTBProvider } from '@services/userAccount/providers/xtb'
import {
  ApolloResourceNotFound,
  ApolloForbidden,
} from '@typings/errors/apolloErrors'

enum UserAccountType {
  saving = 'saving',
  securities = 'securities',
}

enum UserAccountProvider {
  xtb = 'xtb',
}

const UserAccountProviderClass: { [key: string]: typeof SecurityProvider } = {
  [UserAccountProvider.xtb]: XTBProvider,
}

class UserAccount extends SoftDeleteModel {
  name: string

  type: UserAccountType

  provider?: UserAccountProvider

  balance: number

  userId: string

  user: User

  static get tableName() {
    return 'user_accounts'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name', 'type', 'balance', 'userId'],
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.userId`,
          to: `${User.tableName}.id`,
        },
      },
      userAccountSecurities: {
        relation: Model.HasManyRelation,
        modelClass: UserAccountSecurity,
        join: {
          from: `${this.tableName}.id`,
          to: `${UserAccountSecurity.tableName}.userAccountId`,
        },
      },
    }
  }

  static checkOwnership = async (
    id?: number | string,
    userId?: string,
    trx?: Transaction
  ) => {
    if (!id) return

    const userAccount = await UserAccount.query(trx).findById(id)
    if (!userAccount) {
      throw new ApolloResourceNotFound('GROUP_NOT_FOUND')
    }
    if (userAccount.userId !== userId) {
      throw new ApolloForbidden('ACCESS_DENIED')
    }
  }
}

class PaginatedUserAccount extends PaginatedClass(UserAccount) {}

export {
  UserAccount,
  PaginatedUserAccount,
  UserAccountType,
  UserAccountProvider,
  UserAccountProviderClass,
}
