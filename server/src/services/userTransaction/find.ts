import { QueryBuilder } from 'objection'

import { UserTransaction } from '@models/userTransaction'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { UserTransactionFilters } from '@resolvers/userTransaction/userTransaction.inputs'
import { ServiceMethod } from '@services/service'

class UserTransactionFindMethod extends ServiceMethod {
  run = async (
    filters: UserTransactionFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<UserTransaction>> => {
    return UserTransaction.paginate(
      UserTransactionFindMethod.applyFilters(
        UserTransaction.query(this.trx),
        filters
      ),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<UserTransaction>,
    filters: UserTransactionFilters
  ) => {
    if (filters.userId) {
      query.where('userId', filters.userId)
    }
    if (filters.limitDate) {
      query
        .where('date', '<=', filters.limitDate)
        .where('date', '>=', new Date().toISOString())
    }
    if (filters.categories) {
      query.whereIn('category', filters.categories)
    }
    if (filters.types) {
      query.whereIn('type', filters.types)
    }
    if (filters.frequencies) {
      query.whereIn('frequency', filters.frequencies)
    }
    return query
  }
}

export { UserTransactionFindMethod }
