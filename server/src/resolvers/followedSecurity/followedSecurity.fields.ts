import { FollowedSecurity } from '@models/followedSecurity'
import { RequestContext } from '@typings/context'

class FollowedSecurityFieldsResolver {
  async security(followedSecurity: FollowedSecurity, ctx: RequestContext) {
    return ctx.loaders!.followedSecuritySecurity.load(
      followedSecurity.securityId
    )
  }

  async followedSecurityGroup(
    followedSecurity: FollowedSecurity,
    ctx: RequestContext
  ) {
    return ctx.loaders!.followedSecurityFollowedSecurityGroup.load(
      followedSecurity.followedSecurityGroupId
    )
  }
}

export { FollowedSecurityFieldsResolver }
