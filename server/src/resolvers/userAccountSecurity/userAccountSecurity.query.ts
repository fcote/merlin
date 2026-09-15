import { OrderOptions, PaginationOptions } from '@resolvers/paginated'
import { UserAccountSecurityFilters } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { RequestContext } from '@typings/context'

class SelfUserAccountSecurityQueryResolver {
  async userAccountSecurities(
    ctx: RequestContext,

    filters?: UserAccountSecurityFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new UserAccountSecurityService(ctx).find(
      {
        ...filters,
        userId: ctx.user!.id,
      },
      paginate,
      orderBy
    )
  }
}

export { SelfUserAccountSecurityQueryResolver }
