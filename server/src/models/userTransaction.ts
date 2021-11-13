import { GraphQLDateTime } from 'graphql-scalars'
import { JSONSchema, Model, Transaction } from 'objection'
import { registerEnumType, Field, Float, ObjectType } from 'type-graphql'

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

registerEnumType(UserTransactionCategory, {
  name: 'UserTransactionCategory',
})

enum UserTransactionType {
  income = 'income',
  expense = 'expense',
}

registerEnumType(UserTransactionType, {
  name: 'UserTransactionType',
})

enum UserTransactionFrequency {
  daily = 'daily',
  monthly = 'monthly',
  punctual = 'punctual',
}

registerEnumType(UserTransactionFrequency, {
  name: 'UserTransactionFrequency',
})

@ObjectType('UserTransaction')
class UserTransaction extends SoftDeleteModel {
  @Field((_) => String, { nullable: true })
  name: string
  @Field((_) => Float, { nullable: true })
  value: number
  @Field((_) => UserTransactionCategory)
  category: UserTransactionCategory
  @Field((_) => UserTransactionType)
  type: UserTransactionType
  @Field((_) => UserTransactionFrequency)
  frequency: UserTransactionFrequency
  @Field((_) => GraphQLDateTime, { nullable: true })
  date: string

  @Field((_) => String)
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

@ObjectType('PaginatedUserTransaction')
class PaginatedUserTransaction extends PaginatedClass(UserTransaction) {}

export {
  UserTransaction,
  UserTransactionCategory,
  UserTransactionFrequency,
  UserTransactionType,
  PaginatedUserTransaction,
}
