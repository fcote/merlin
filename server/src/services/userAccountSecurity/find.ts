import { QueryBuilder } from 'objection'

import { UserAccountSecurity } from '@models/userAccountSecurity'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { UserAccountSecurityFilters } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { ServiceMethod } from '@services/service'

class UserAccountSecurityFindMethod extends ServiceMethod {
  run = async (
    filters: UserAccountSecurityFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<UserAccountSecurity>> => {
    return UserAccountSecurity.paginate(
      this.applyFilters(UserAccountSecurity.query(this.trx), filters),
      paginate,
      orderBy
    )
  }

  applyFilters = (
    query: QueryBuilder<UserAccountSecurity>,
    filters: UserAccountSecurityFilters
  ) => {
    query.joinRelated('[userAccount, security]')

    if (filters.ticker) {
      query.where('security.ticker', filters.ticker)
    }
    if (filters.userId) {
      query.where('userAccount.userId', filters.userId)
    }
    if (filters.accountId) {
      query.whereIn('userAccountId', filters.accountId)
    }

    return query
  }
}

export { UserAccountSecurityFindMethod }
