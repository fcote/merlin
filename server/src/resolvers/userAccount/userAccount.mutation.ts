import { UserAccount } from '@models/userAccount'
import {
  UserAccountSyncFields,
  UserAccountFields,
} from '@resolvers/userAccount/userAccount.inputs'
import { UserAccountService } from '@services/userAccount'
import { RequestContext } from '@typings/context'

class SelfUserAccountMutationResolver {
  async syncUserAccount(inputs: UserAccountSyncFields, ctx: RequestContext) {
    await UserAccount.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new UserAccountService(ctx).sync(inputs)
  }

  async upsertUserAccount(inputs: UserAccountFields, ctx: RequestContext) {
    await UserAccount.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new UserAccountService(ctx).upsert({
      ...inputs,
      userId: ctx.user!.id,
    })
  }
}

export { SelfUserAccountMutationResolver }
