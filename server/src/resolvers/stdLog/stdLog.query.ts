import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { StdLogService } from '@services/stdLog'
import { RequestContext } from '@typings/context'

class StdLogQueryResolver {
  stdLogs(
    ctx: RequestContext,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new StdLogService(ctx).find(paginate, orderBy)
  }
}

export { StdLogQueryResolver }
