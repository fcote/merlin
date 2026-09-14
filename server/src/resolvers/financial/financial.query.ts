import { FieldList } from '@resolvers/fields'
import { FinancialFilters } from '@resolvers/financial/financial.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialService } from '@services/financial'
import { RequestContext } from '@typings/context'

class FinancialQueryResolver {
  financials(
    ctx: RequestContext,
    fields: FieldList,

    filters?: FinancialFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new FinancialService(ctx).find(filters, paginate, orderBy, fields)
  }
}

export { FinancialQueryResolver }
