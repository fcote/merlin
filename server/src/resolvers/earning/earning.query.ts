import { EarningFilters } from '@resolvers/earning/earning.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { EarningService } from '@services/earning'
import { RequestContext } from '@typings/context'

class EarningQueryResolver {
  earnings(
    ctx: RequestContext,

    filters?: EarningFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new EarningService(ctx).find(filters, paginate, orderBy)
  }

  earningCallTranscript(ctx: RequestContext, earningId: number | string) {
    return new EarningService(ctx).callTranscript(earningId)
  }
}

class SelfEarningQueryResolver {
  async earnings(
    ctx: RequestContext,

    filters?: UserAccountFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new EarningService(ctx).find(
      {
        ...filters,
        userId: ctx.user?.id,
      },
      paginate,
      orderBy
    )
  }
}

export { EarningQueryResolver, SelfEarningQueryResolver }
