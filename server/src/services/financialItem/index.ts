import { FieldList } from '@resolvers/fields'
import { FinancialItemFilters } from '@resolvers/financialItem/financialItem.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialItemFindMethod } from '@services/financialItem/find'
import { Service } from '@services/service'

class FinancialItemService extends Service {
  find = async (
    filters: FinancialItemFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[],
    fields?: FieldList
  ) => new FinancialItemFindMethod(this).run(filters, paginate, orderBy, fields)
}

export { FinancialItemService }
