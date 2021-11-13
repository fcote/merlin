import { Resolver, FieldResolver, Ctx, Arg, Authorized } from 'type-graphql'

import { PaginatedUserAccount } from '@models/userAccount'
import { Right } from '@resolvers'
import { OrderOptions, PaginationOptions } from '@resolvers/paginated'
import { SelfQuery } from '@resolvers/root'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { UserAccountService } from '@services/userAccount'
import { RequestContext } from '@typings/context'

@Resolver(SelfQuery)
class SelfUserAccountQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => PaginatedUserAccount)
  async userAccounts(
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => UserAccountFilters, { nullable: true })
    filters?: UserAccountFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
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
