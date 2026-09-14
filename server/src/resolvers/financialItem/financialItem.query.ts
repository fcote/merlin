import { FieldList } from '@resolvers/fields'
import { FinancialItemFilters } from '@resolvers/financialItem/financialItem.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialItemService } from '@services/financialItem'
import { RequestContext } from '@typings/context'

class FinancialItemQueryResolver {
  financialItems(
    ctx: RequestContext,
    fields: FieldList,

    filters?: FinancialItemFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new FinancialItemService(ctx).find(
      filters,
      paginate,
      orderBy,
      fields
    )
  }
}

export { FinancialItemQueryResolver }
