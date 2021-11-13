import { QueryBuilder } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { FinancialItem } from '@models/financialItem'
import { FieldList } from '@resolvers/fields'
import { FinancialItemFilters } from '@resolvers/financialItem/financialItem.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class FinancialItemFindMethod extends ServiceMethod {
  run = async (
    filters?: FinancialItemFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[],
    fields?: FieldList
  ) => {
    const query = FinancialItem.query(this.trx).select(
      selectFields(fields, FinancialItem)
    )
    return FinancialItem.paginate(
      FinancialItemFindMethod.applyFilters(query, filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<FinancialItem>,
    filters?: FinancialItemFilters
  ) => {
    if (filters?.type) {
      query.where('financial_items.type', filters.type)
    }
    return query
  }
}

export { FinancialItemFindMethod }
