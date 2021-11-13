import { Resolver, FieldResolver, Root, Ctx, Arg } from 'type-graphql'

import { PaginatedFollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { RequestContext } from '@typings/context'

@Resolver(FollowedSecurityGroup)
class FollowedSecurityGroupFieldsResolver {
  @FieldResolver((_) => PaginatedFollowedSecurity)
  async followedSecurities(
    @Root() followedSecurityGroup: FollowedSecurityGroup,
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => FollowedSecurityFilters, { nullable: true })
    filters?: FollowedSecurityFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ) {
    return ctx.loaders!.followedSecurityGroupFollowedSecurities.load({
      followedSecurityGroupId: followedSecurityGroup.id,
      filters,
      paginate,
      orderBy,
    })
  }
}

export { FollowedSecurityGroupFieldsResolver }
