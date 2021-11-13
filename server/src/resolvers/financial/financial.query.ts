import { CacheScope } from 'apollo-server-types'
import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { PaginatedFinancial } from '@models/financial'
import { Right } from '@resolvers'
import { CacheControl } from '@resolvers/cacheControl'
import { Fields, FieldList } from '@resolvers/fields'
import { FinancialFilters } from '@resolvers/financial/financial.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialService } from '@services/financial'
import { RequestContext } from '@typings/context'

@Resolver()
class FinancialQueryResolver {
  @Authorized([Right.authenticated])
  @CacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
  @Query((_) => PaginatedFinancial)
  financials(
    @Ctx() ctx: RequestContext,
    @Fields() fields: FieldList,
    @Arg('filters', (_) => FinancialFilters, { nullable: true })
    filters?: FinancialFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ) {
    return new FinancialService(ctx).find(filters, paginate, orderBy, fields)
  }
}

export { FinancialQueryResolver }
