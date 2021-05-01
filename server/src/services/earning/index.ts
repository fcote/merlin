import { EarningFilters } from '@resolvers/earning/earning.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { EarningCallTranscriptMethod } from '@services/earning/callTranscript'
import { EarningFindMethod } from '@services/earning/find'
import { EarningSyncMethod } from '@services/earning/sync'
import { SecuritySyncEmitter } from '@services/security/sync'
import { Service } from '@services/service'

class EarningService extends Service {
  find = async (
    filters: EarningFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ) => new EarningFindMethod(this).run(filters, paginate, orderBy)

  callTranscript = (earningId: number | string) =>
    new EarningCallTranscriptMethod(this).run(earningId)
  sync = (
    ticker: string,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) =>
    new EarningSyncMethod(this).run(ticker, securitySyncEmitter, targetProgress)
}

export { EarningService }
