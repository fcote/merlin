import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { PaginatedNews } from '@models/news'
import { Right } from '@resolvers'
import { Fields, FieldList } from '@resolvers/fields'
import { NewsFilters } from '@resolvers/news/news.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { NewsService } from '@services/news'
import { RequestContext } from '@typings/context'

@Resolver()
class NewsQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => PaginatedNews)
  news(
    @Ctx() ctx: RequestContext,
    @Fields() fields: FieldList,
    @Arg('filters', (_) => NewsFilters, { nullable: true })
    filters?: NewsFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ) {
    return new NewsService(ctx).find(filters, paginate, orderBy, fields)
  }
}

export { NewsQueryResolver }
