import { FieldList } from '@resolvers/fields'
import { NewsFilters } from '@resolvers/news/news.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { NewsFindMethod } from '@services/news/find'
import { NewsSyncMethod } from '@services/news/sync'
import { SecuritySyncEmitter } from '@services/security/sync'
import { Service } from '@services/service'

class NewsService extends Service {
  find = async (
    filters?: NewsFilters,
    pagination?: PaginationOptions,
    orderBy?: OrderOptions[],
    fields?: FieldList
  ) => new NewsFindMethod(this).run(filters, pagination, orderBy, fields)

  sync = (
    ticker: string,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) => new NewsSyncMethod(this).run(ticker, securitySyncEmitter, targetProgress)
}

export { NewsService }
