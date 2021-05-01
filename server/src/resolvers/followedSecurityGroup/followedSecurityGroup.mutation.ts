import { Ctx, FieldResolver, Resolver, Arg, Authorized } from 'type-graphql'

import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { Right } from '@resolvers'
import { FollowedSecurityGroupFields } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import { SelfMutation } from '@resolvers/root'
import { FollowedSecurityGroupService } from '@services/followedSecurityGroup'
import { RequestContext } from '@typings/context'

@Resolver(SelfMutation)
class SelfFollowedSecurityGroupQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => FollowedSecurityGroup)
  async upsertFollowedSecurityGroup(
    @Arg('inputs', (_) => FollowedSecurityGroupFields)
    inputs: FollowedSecurityGroupFields,
    @Ctx() ctx: RequestContext
  ): Promise<FollowedSecurityGroup> {
    await FollowedSecurityGroup.checkOwnership(inputs.id, ctx.user.id, ctx.trx)
    return new FollowedSecurityGroupService(ctx).upsert({
      ...inputs,
      userId: ctx.user.id,
    })
  }
}

export { SelfFollowedSecurityGroupQueryResolver }
