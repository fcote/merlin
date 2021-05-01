import { Ctx, FieldResolver, Resolver, Arg, Authorized } from 'type-graphql'

import { UserAccount } from '@models/userAccount'
import { Right } from '@resolvers'
import { SelfMutation } from '@resolvers/root'
import {
  UserAccountSyncFields,
  UserAccountFields,
} from '@resolvers/userAccount/userAccount.inputs'
import { UserAccountService } from '@services/userAccount'
import { RequestContext } from '@typings/context'

@Resolver(SelfMutation)
class SelfUserAccountMutationResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => UserAccount)
  async syncUserAccount(
    @Arg('inputs', (_) => UserAccountSyncFields) inputs: UserAccountSyncFields,
    @Ctx() ctx: RequestContext
  ): Promise<UserAccount> {
    await UserAccount.checkOwnership(inputs.id, ctx.user.id, ctx.trx)
    return new UserAccountService(ctx).sync(inputs)
  }

  @Authorized([Right.authenticated])
  @FieldResolver((_) => UserAccount)
  async upsertUserAccount(
    @Arg('inputs', (_) => UserAccountFields) inputs: UserAccountFields,
    @Ctx() ctx: RequestContext
  ): Promise<UserAccount> {
    await UserAccount.checkOwnership(inputs.id, ctx.user.id, ctx.trx)
    return new UserAccountService(ctx).upsert({
      ...inputs,
      userId: ctx.user.id,
    })
  }
}

export { SelfUserAccountMutationResolver }
