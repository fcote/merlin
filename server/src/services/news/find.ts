import { QueryBuilder } from 'objection'

import { selectFields } from '@models/base/selectFields'
import { News } from '@models/news'
import { FieldList } from '@resolvers/fields'
import { NewsFilters } from '@resolvers/news/news.inputs'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class NewsFindMethod extends ServiceMethod {
  run = async (
    filters: NewsFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[],
    fields?: FieldList
  ): Promise<Paginated<News>> => {
    const query = News.query(this.trx).select(selectFields(fields, News))
    return News.paginate(
      NewsFindMethod.applyFilters(query, filters),
      paginate,
      orderBy
    )
  }

  static applyFilters = (query: QueryBuilder<News>, filters: NewsFilters) => {
    query.joinRelated('security')

    if (filters.ticker) {
      query.where('security.ticker', filters.ticker)
    }

    return query
  }
}

export { NewsFindMethod }
