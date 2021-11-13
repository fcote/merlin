import { QueryBuilder } from 'objection'

import { Security } from '@models/security'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { SecurityFilters } from '@resolvers/security/security.inputs'
import { ServiceMethod } from '@services/service'

class SecurityFindMethod extends ServiceMethod {
  run = async (
    filters?: SecurityFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ): Promise<Paginated<Security>> => {
    return Security.paginate(
      this.applyFilters(Security.query(this.trx), filters),
      paginate,
      orderBy
    )
  }

  applyFilters = (
    query: QueryBuilder<Security>,
    filters: SecurityFilters = {}
  ) => {
    query.leftJoinRelated('followedSecurities')

    if (filters.ticker) {
      query.where('ticker', filters.ticker)
    }
    if (filters.followedSecurityGroupId) {
      query.where(
        'followedSecurities.followedSecurityGroupId',
        filters.followedSecurityGroupId
      )
    }

    return query
  }
}

export { SecurityFindMethod }
