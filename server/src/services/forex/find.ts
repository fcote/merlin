import { QueryBuilder, fn, ref } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { Forex } from '@models/forex'
import { FieldList } from '@resolvers/fields'
import { ForexFilters } from '@resolvers/forex/forex.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class ForexFindMethod extends ServiceMethod {
  run = async (
    filters: ForexFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[],
    fields?: FieldList
  ) => {
    const query = Forex.query(this.trx).select(selectFields(fields, Forex))
    return Forex.paginate(
      ForexFindMethod.applyFilters(query, filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (query: QueryBuilder<Forex>, filters: ForexFilters) => {
    if (filters.currencyPairs) {
      query.whereIn(
        fn.concat(ref('forex.fromCurrency'), ref('forex.toCurrency')),
        filters.currencyPairs.map((p) => `${p.fromCurrency}${p.toCurrency}`)
      )
    }

    return query
  }
}

export { ForexFindMethod }
