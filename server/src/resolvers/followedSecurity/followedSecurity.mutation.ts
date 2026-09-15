import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityFields } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { FollowedSecurityService } from '@services/followedSecurity'
import { RequestContext } from '@typings/context'

class SelfFollowedSecurityQueryResolver {
  async linkFollowedSecurity(
    inputs: FollowedSecurityFields,
    ctx: RequestContext
  ) {
    await FollowedSecurityGroup.checkOwnership(
      inputs.followedSecurityGroupId,
      ctx.user?.id,
      ctx.trx
    )
    return new FollowedSecurityService(ctx).link(inputs)
  }

  async unlinkFollowedSecurity(
    inputs: FollowedSecurityFields,
    ctx: RequestContext
  ) {
    await FollowedSecurityGroup.checkOwnership(
      inputs.followedSecurityGroupId,
      ctx.user?.id,
      ctx.trx
    )
    return new FollowedSecurityService(ctx).unlink(inputs)
  }
}

export { SelfFollowedSecurityQueryResolver }
