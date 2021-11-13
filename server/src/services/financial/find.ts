import { QueryBuilder } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { Financial, FinancialFreq, FinancialPeriod } from '@models/financial'
import { FieldList } from '@resolvers/fields'
import { FinancialFilters } from '@resolvers/financial/financial.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class FinancialFindMethod extends ServiceMethod {
  run = async (
    filters?: FinancialFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[],
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
    filters?: FinancialFilters
  ) => {
    query.joinRelated('[security, financialItem]')

    if (filters?.freq) {
      const periodFilter =
        filters.freq === FinancialFreq.Q
          ? [
              FinancialPeriod.Q1,
              FinancialPeriod.Q2,
              FinancialPeriod.Q3,
              FinancialPeriod.Q4,
            ]
          : [filters.freq]
      query.whereIn('financials.period', periodFilter)
    }
    if (filters?.estimate !== undefined) {
      query.where('financials.isEstimate', filters.estimate)
    }
    if (filters?.ticker) {
      query.where('security.ticker', filters.ticker)
    }
    if (filters?.statement) {
      query.where('financialItem.statement', filters.statement)
    }
    if (filters?.type) {
      query.where('financialItem.type', filters.type)
    }

    return query
  }
}

export { FinancialFindMethod }
