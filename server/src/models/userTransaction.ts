import { JSONSchema, Model, Transaction } from 'objection'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { User } from '@models/user'
import { PaginatedClass } from '@resolvers/paginated'
import {
  ApolloResourceNotFound,
  ApolloForbidden,
} from '@typings/errors/apolloErrors'

enum UserTransactionCategory {
  subscription = 'subscription',
  groceries = 'groceries',
  extra = 'extra',
  rent = 'rent',
}

enum UserTransactionType {
  income = 'income',
  expense = 'expense',
}

enum UserTransactionFrequency {
  daily = 'daily',
  monthly = 'monthly',
  punctual = 'punctual',
}

class UserTransaction extends SoftDeleteModel {
  name: string

  value: number

  category: UserTransactionCategory

  type: UserTransactionType

  frequency: UserTransactionFrequency

  date: string

  userId: string

  user: User

  static get tableName() {
    return 'user_transactions'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['value', 'category', 'type', 'frequency'],
  }

  static get relationMappings() {
    return {
      securities: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.user_id`,
          to: `${User.tableName}.id`,
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

    const userTransaction = await UserTransaction.query(trx).findById(id)
    if (!userTransaction) {
      throw new ApolloResourceNotFound('TRANSACTION_NOT_FOUND')
    }
    if (userTransaction.userId !== userId) {
      throw new ApolloForbidden('ACCESS_DENIED')
    }
  }
}

class PaginatedUserTransaction extends PaginatedClass(UserTransaction) {}

export {
  UserTransaction,
  UserTransactionCategory,
  UserTransactionFrequency,
  UserTransactionType,
  PaginatedUserTransaction,
}
