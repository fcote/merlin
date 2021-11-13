import { FieldList } from '@resolvers/fields'
import { HistoricalPriceFilters } from '@resolvers/historicalPrice/historicalPrice.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { HistoricalPriceFindMethod } from '@services/historicalPrice/find'
import { HistoricalPriceSyncMethod } from '@services/historicalPrice/sync'
import { HistoricalPriceSyncEndOfDayMethod } from '@services/historicalPrice/syncEndOfDay'
import { SecuritySyncEmitter } from '@services/security/sync'
import { Service } from '@services/service'

class HistoricalPriceService extends Service {
  find = async (
    filters?: HistoricalPriceFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[],
    fields?: FieldList
  ) =>
    new HistoricalPriceFindMethod(this).run(filters, paginate, orderBy, fields)

  sync = (
    ticker: string,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) =>
    new HistoricalPriceSyncMethod(this).run(
      ticker,
      securitySyncEmitter,
      targetProgress
    )
  syncEndOfDay = (tickers: string[]) =>
    new HistoricalPriceSyncEndOfDayMethod(this).run(tickers)
}

export { HistoricalPriceService }
