import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { PaginatedHistoricalPrice } from '@models/historicalPrice'
import { Right } from '@resolvers'
import { Fields, FieldList } from '@resolvers/fields'
import { HistoricalPriceFilters } from '@resolvers/historicalPrice/historicalPrice.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { HistoricalPriceService } from '@services/historicalPrice'
import { RequestContext } from '@typings/context'

@Resolver()
class HistoricalPriceQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => PaginatedHistoricalPrice)
  historicalPrices(
    @Ctx() ctx: RequestContext,
    @Fields() fields: FieldList,
    @Arg('filters', (_) => HistoricalPriceFilters, { nullable: true })
    filters?: HistoricalPriceFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedHistoricalPrice> {
    return new HistoricalPriceService(ctx).find(
      filters,
      paginate,
      orderBy,
      fields
    )
  }
}

export { HistoricalPriceQueryResolver }
