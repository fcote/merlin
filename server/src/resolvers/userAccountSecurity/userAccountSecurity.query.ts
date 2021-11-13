import { Resolver, FieldResolver, Ctx, Arg, Authorized } from 'type-graphql'

import { PaginatedUserAccountSecurity } from '@models/userAccountSecurity'
import { Right } from '@resolvers'
import { OrderOptions, PaginationOptions } from '@resolvers/paginated'
import { SelfQuery } from '@resolvers/root'
import { UserAccountSecurityFilters } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { RequestContext } from '@typings/context'

@Resolver(SelfQuery)
class SelfUserAccountSecurityQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => PaginatedUserAccountSecurity)
  async userAccountSecurities(
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => UserAccountSecurityFilters, { nullable: true })
    filters?: UserAccountSecurityFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
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
