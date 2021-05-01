import { QueryBuilder } from 'objection'

import { Earning } from '@models/earning'
import { EarningFilters } from '@resolvers/earning/earning.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class EarningFindMethod extends ServiceMethod {
  run = async (
    filters: EarningFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ) => {
    return Earning.paginate(
      EarningFindMethod.applyFilters(
        Earning.query(this.trx).select('earnings.*'),
        filters
      ),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<Earning>,
    filters: EarningFilters
  ) => {
    query.joinRelated('security')

    if (filters.ticker) {
      query.where('security.ticker', filters.ticker)
    }

    return query
  }
}

export { EarningFindMethod }
