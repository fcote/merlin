import {
  Ctx,
  FieldResolver,
  Resolver,
  Arg,
  Int,
  Authorized,
} from 'type-graphql'

import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { Right } from '@resolvers'
import { FollowedSecurityFields } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { SelfMutation } from '@resolvers/root'
import { FollowedSecurityService } from '@services/followedSecurity'
import { RequestContext } from '@typings/context'

@Resolver(SelfMutation)
class SelfFollowedSecurityQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => FollowedSecurity)
  async linkFollowedSecurity(
    @Arg('inputs', (_) => FollowedSecurityFields)
    inputs: FollowedSecurityFields,
    @Ctx() ctx: RequestContext
  ): Promise<FollowedSecurity> {
    await FollowedSecurityGroup.checkOwnership(
      inputs.followedSecurityGroupId,
      ctx.user.id,
      ctx.trx
    )
    return new FollowedSecurityService(ctx).link(inputs)
  }

  @Authorized([Right.authenticated])
  @FieldResolver((_) => Int)
  async unlinkFollowedSecurity(
    @Arg('inputs', (_) => FollowedSecurityFields)
    inputs: FollowedSecurityFields,
    @Ctx() ctx: RequestContext
  ): Promise<number> {
    await FollowedSecurityGroup.checkOwnership(
      inputs.followedSecurityGroupId,
      ctx.user.id,
      ctx.trx
    )
    return new FollowedSecurityService(ctx).unlink(inputs)
  }
}

export { SelfFollowedSecurityQueryResolver }
