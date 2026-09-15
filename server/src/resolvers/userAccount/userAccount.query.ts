import { OrderOptions, PaginationOptions } from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { UserAccountService } from '@services/userAccount'
import { RequestContext } from '@typings/context'

class SelfUserAccountQueryResolver {
  async userAccounts(
    ctx: RequestContext,

    filters?: UserAccountFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new UserAccountService(ctx).find(
      {
        ...filters,
        userId: ctx.user!.id,
      },
      paginate,
      orderBy
    )
  }
}

export { SelfUserAccountQueryResolver }
