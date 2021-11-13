import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { Security } from '@models/security'
import { RequestContext } from '@typings/context'

@Resolver(FollowedSecurity)
class FollowedSecurityFieldsResolver {
  @FieldResolver((_) => Security)
  async security(
    @Root() followedSecurity: FollowedSecurity,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.loaders!.followedSecuritySecurity.load(
      followedSecurity.securityId
    )
  }

  @FieldResolver((_) => FollowedSecurityGroup)
  async followedSecurityGroup(
    @Root() followedSecurity: FollowedSecurity,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.loaders!.followedSecurityFollowedSecurityGroup.load(
      followedSecurity.followedSecurityGroupId
    )
  }
}

export { FollowedSecurityFieldsResolver }
