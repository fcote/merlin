import { QueryBuilder } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { HistoricalPrice } from '@models/historicalPrice'
import { FieldList } from '@resolvers/fields'
import { HistoricalPriceFilters } from '@resolvers/historicalPrice/historicalPrice.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class HistoricalPriceFindMethod extends ServiceMethod {
  run = async (
    filters?: HistoricalPriceFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[],
    fields?: FieldList
  ) => {
    const query = HistoricalPrice.query(this.trx).select(
      selectFields(fields, HistoricalPrice)
    )
    return HistoricalPrice.paginate(
      HistoricalPriceFindMethod.applyFilters(query, filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<HistoricalPrice>,
    filters?: HistoricalPriceFilters
  ) => {
    query.joinRelated('security')

    if (filters?.ticker) {
      query.where('security.ticker', filters.ticker)
    }

    return query
  }
}

export { HistoricalPriceFindMethod }
