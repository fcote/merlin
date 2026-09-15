import { FieldList } from '@resolvers/fields'
import { NewsFilters } from '@resolvers/news/news.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { NewsService } from '@services/news'
import { RequestContext } from '@typings/context'

class NewsQueryResolver {
  news(
    ctx: RequestContext,
    fields: FieldList,

    filters?: NewsFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new NewsService(ctx).find(filters, paginate, orderBy, fields)
  }
}

export { NewsQueryResolver }
