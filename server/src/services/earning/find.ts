import { QueryBuilder } from 'objection'

import { Earning } from '@models/earning'
import { EarningFilters } from '@resolvers/earning/earning.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class EarningFindMethod extends ServiceMethod {
  run = async (
    filters?: EarningFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) => {
    return Earning.paginate(
      EarningFindMethod.applyFilters(
        Earning.query(this.trx).distinct('earnings.id').select('earnings.*'),
        filters
      ),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<Earning>,
    filters: EarningFilters = {}
  ) => {
    if (filters.userId) {
      query.leftJoinRelated(
        'security.[followedSecurities.followedSecurityGroup, userAccountSecurities.userAccount]'
      )
    } else {
      query.joinRelated('security')
    }

    if (filters.ticker) {
      query.where('security.ticker', filters.ticker)
    }

    if (filters.fromDate) {
      query.where('earnings.date', '>=', filters.fromDate)
    }

    if (filters.toDate) {
      query.where('earnings.date', '<=', filters.toDate)
    }

    if (filters.userId) {
      query.where((q) =>
        q
          .where(
            'security:followedSecurities:followedSecurityGroup.userId',
            filters.userId!
          )
          .orWhere(
            'security:userAccountSecurities:userAccount.userId',
            filters.userId!
          )
      )
    }

    return query
  }
}

export { EarningFindMethod }
