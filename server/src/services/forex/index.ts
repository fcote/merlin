import { ForexExchangeRateResult } from '@links/types'
import { FieldList } from '@resolvers/fields'
import { ForexFilters } from '@resolvers/forex/forex.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { ForexFindMethod } from '@services/forex/find'
import { ForexSyncMethod } from '@services/forex/sync'
import { Service } from '@services/service'

class ForexService extends Service {
  find = async (
    filters: ForexFilters,
    pagination: PaginationOptions,
    orderBy: OrderOptions[],
    fields?: FieldList
  ) => new ForexFindMethod(this).run(filters, pagination, orderBy, fields)

  sync = (inputs: ForexExchangeRateResult) =>
    new ForexSyncMethod(this).run(inputs)
}

export { ForexService }
