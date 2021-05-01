import { QueryBuilder } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { Financial, FinancialFreq } from '@models/financial'
import { FieldList } from '@resolvers/fields'
import { FinancialFilters } from '@resolvers/financial/financial.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class FinancialFindMethod extends ServiceMethod {
  run = async (
    filters: FinancialFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[],
    fields?: FieldList
  ) => {
    const query = Financial.query(this.trx).select(
      selectFields(fields, Financial)
    )
    return Financial.paginate(
      FinancialFindMethod.applyFilters(query, filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<Financial>,
    filters: FinancialFilters
  ) => {
    query.joinRelated('[security, financialItem]')

    if (filters.freq) {
      query.where(
        'financials.period',
        'like',
        filters.freq === FinancialFreq.Q ? 'Q%' : filters.freq
      )
    }
    if (filters.ticker) {
      query.where('security.ticker', filters.ticker)
    }
    if (filters.statement) {
      query.where('financialItem.statement', filters.statement)
    }
    if (filters.type) {
      query.where('financialItem.type', filters.type)
    }
    return query
  }
}

export { FinancialFindMethod }
