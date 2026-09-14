import { UserTransaction } from '@models/userTransaction'
import { UserTransactionFields } from '@resolvers/userTransaction/userTransaction.inputs'
import { UserTransactionService } from '@services/userTransaction'
import { RequestContext } from '@typings/context'

class SelfUserTransactionQueryResolver {
  async upsertUserTransaction(
    inputs: UserTransactionFields,
    ctx: RequestContext
  ) {
    await UserTransaction.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new UserTransactionService(ctx).upsert({
      ...inputs,
      userId: ctx.user!.id,
    })
  }
}

export { SelfUserTransactionQueryResolver }
