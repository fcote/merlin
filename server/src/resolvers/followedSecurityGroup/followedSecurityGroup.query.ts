import { Resolver, FieldResolver, Ctx, Arg, Authorized } from 'type-graphql'

import {
  FollowedSecurityGroup,
  PaginatedFollowedSecurityGroup,
} from '@models/followedSecurityGroup'
import { Right } from '@resolvers'
import { FollowedSecurityGroupFilters } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import {
  OrderOptions,
  PaginationOptions,
  Paginated,
} from '@resolvers/paginated'
import { SelfQuery } from '@resolvers/root'
import { FollowedSecurityGroupService } from '@services/followedSecurityGroup'
import { RequestContext } from '@typings/context'

@Resolver(SelfQuery)
class SelfFollowedSecurityGroupQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => PaginatedFollowedSecurityGroup)
  async followedSecurityGroups(
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => FollowedSecurityGroupFilters, { nullable: true })
    filters?: FollowedSecurityGroupFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<Paginated<FollowedSecurityGroup>> {
    return new FollowedSecurityGroupService(ctx).find(
      {
        ...filters,
        userId: ctx.user.id,
      },
      paginate,
      orderBy
    )
  }
}

export { SelfFollowedSecurityGroupQueryResolver }
