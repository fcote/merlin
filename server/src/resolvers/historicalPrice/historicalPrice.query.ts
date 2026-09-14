import { FieldList } from '@resolvers/fields'
import { HistoricalPriceFilters } from '@resolvers/historicalPrice/historicalPrice.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { HistoricalPriceService } from '@services/historicalPrice'
import { RequestContext } from '@typings/context'

class HistoricalPriceQueryResolver {
  historicalPrices(
    ctx: RequestContext,
    fields: FieldList,

    filters?: HistoricalPriceFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new HistoricalPriceService(ctx).find(
      filters,
      paginate,
      orderBy,
      fields
    )
  }
}

export { HistoricalPriceQueryResolver }
