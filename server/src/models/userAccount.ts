import { JSONSchema, Model, Transaction } from 'objection'
import { registerEnumType, ObjectType, Field, Float } from 'type-graphql'

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

registerEnumType(UserAccountType, {
  name: 'UserAccountType',
})

enum UserAccountProvider {
  xtb = 'xtb',
}

registerEnumType(UserAccountProvider, {
  name: 'UserAccountProvider',
})

const UserAccountProviderClass: { [key: string]: typeof SecurityProvider } = {
  [UserAccountProvider.xtb]: XTBProvider,
}

@ObjectType('UserAccount')
class UserAccount extends SoftDeleteModel {
  @Field((_) => String)
  name: string
  @Field((_) => UserAccountType)
  type: UserAccountType
  @Field((_) => UserAccountProvider, { nullable: true })
  provider?: UserAccountProvider
  @Field((_) => Float)
  balance: number

  @Field((_) => String)
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

@ObjectType('PaginatedUserAccount')
class PaginatedUserAccount extends PaginatedClass(UserAccount) {}

export {
  UserAccount,
  PaginatedUserAccount,
  UserAccountType,
  UserAccountProvider,
  UserAccountProviderClass,
}
