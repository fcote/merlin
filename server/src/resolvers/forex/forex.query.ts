import { FieldList } from '@resolvers/fields'
import { ForexFilters } from '@resolvers/forex/forex.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ForexService } from '@services/forex'
import { RequestContext } from '@typings/context'

class ForexQueryResolver {
  forex(
    ctx: RequestContext,
    fields: FieldList,

    filters?: ForexFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new ForexService(ctx).find(filters, paginate, orderBy, fields)
  }
}

export { ForexQueryResolver }
