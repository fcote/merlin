import { FollowedSecurityGroupFilters } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import { OrderOptions, PaginationOptions } from '@resolvers/paginated'
import { FollowedSecurityGroupService } from '@services/followedSecurityGroup'
import { RequestContext } from '@typings/context'

class SelfFollowedSecurityGroupQueryResolver {
  async followedSecurityGroups(
    ctx: RequestContext,

    filters?: FollowedSecurityGroupFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new FollowedSecurityGroupService(ctx).find(
      {
        ...filters,
        userId: ctx.user?.id,
      },
      paginate,
      orderBy
    )
  }
}

export { SelfFollowedSecurityGroupQueryResolver }
