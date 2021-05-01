import { Resolver, FieldResolver, Ctx, Arg, Authorized } from 'type-graphql'

import {
  UserAccountSecurity,
  PaginatedUserAccountSecurity,
} from '@models/userAccountSecurity'
import { Right } from '@resolvers'
import {
  OrderOptions,
  PaginationOptions,
  Paginated,
} from '@resolvers/paginated'
import { SelfQuery } from '@resolvers/root'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { RequestContext } from '@typings/context'

@Resolver(SelfQuery)
class SelfUserAccountSecurityQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => PaginatedUserAccountSecurity)
  async userAccountSecurities(
    @Ctx() ctx: RequestContext,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<Paginated<UserAccountSecurity>> {
    return new UserAccountSecurityService(ctx).find(
      {
        userId: ctx.user.id,
      },
      paginate,
      orderBy
    )
  }
}

export { SelfUserAccountSecurityQueryResolver }
