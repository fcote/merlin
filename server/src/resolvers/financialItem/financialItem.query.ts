import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { PaginatedFinancialItem } from '@models/financialItem'
import { Right } from '@resolvers'
import { Fields, FieldList } from '@resolvers/fields'
import { FinancialItemFilters } from '@resolvers/financialItem/financialItem.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialItemService } from '@services/financialItem'
import { RequestContext } from '@typings/context'

@Resolver()
class FinancialItemQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => PaginatedFinancialItem)
  financialItems(
    @Ctx() ctx: RequestContext,
    @Fields() fields: FieldList,
    @Arg('filters', (_) => FinancialItemFilters, { nullable: true })
    filters?: FinancialItemFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedFinancialItem> {
    return new FinancialItemService(ctx).find(
      filters,
      paginate,
      orderBy,
      fields
    )
  }
}

export { FinancialItemQueryResolver }
