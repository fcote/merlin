import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityGroupFields } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import { FollowedSecurityGroupService } from '@services/followedSecurityGroup'
import { RequestContext } from '@typings/context'

class SelfFollowedSecurityGroupQueryResolver {
  async upsertFollowedSecurityGroup(
    inputs: FollowedSecurityGroupFields,
    ctx: RequestContext
  ) {
    await FollowedSecurityGroup.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new FollowedSecurityGroupService(ctx).upsert({
      ...inputs,
      userId: ctx.user!.id,
    })
  }
}

export { SelfFollowedSecurityGroupQueryResolver }
