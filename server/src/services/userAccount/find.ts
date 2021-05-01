import { QueryBuilder } from 'objection'

import { UserAccount } from '@models/userAccount'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { ServiceMethod } from '@services/service'

class UserAccountFindMethod extends ServiceMethod {
  run = async (
    filters: UserAccountFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<UserAccount>> => {
    return UserAccount.paginate(
      UserAccountFindMethod.applyFilters(UserAccount.query(this.trx), filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<UserAccount>,
    filters: UserAccountFilters = {}
  ) => {
    if (filters.userId) {
      query.where('userId', filters.userId)
    }
    if (filters.types) {
      query.whereIn('type', filters.types)
    }
    return query
  }
}

export { UserAccountFindMethod }
