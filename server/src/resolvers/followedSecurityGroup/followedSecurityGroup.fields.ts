import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { RequestContext } from '@typings/context'

class FollowedSecurityGroupFieldsResolver {
  async followedSecurities(
    followedSecurityGroup: FollowedSecurityGroup,
    ctx: RequestContext,

    filters?: FollowedSecurityFilters,

    paginate?: PaginationOptions,

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
