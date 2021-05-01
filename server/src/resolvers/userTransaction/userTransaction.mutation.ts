import { Ctx, FieldResolver, Resolver, Arg, Authorized } from 'type-graphql'

import { UserTransaction } from '@models/userTransaction'
import { Right } from '@resolvers'
import { SelfMutation } from '@resolvers/root'
import { UserTransactionFields } from '@resolvers/userTransaction/userTransaction.inputs'
import { UserTransactionService } from '@services/userTransaction'
import { RequestContext } from '@typings/context'

@Resolver(SelfMutation)
class SelfUserTransactionQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => UserTransaction)
  async upsertUserTransaction(
    @Arg('inputs', (_) => UserTransactionFields) inputs: UserTransactionFields,
    @Ctx() ctx: RequestContext
  ): Promise<UserTransaction> {
    await UserTransaction.checkOwnership(inputs.id, ctx.user.id, ctx.trx)
    return new UserTransactionService(ctx).upsert({
      ...inputs,
      userId: ctx.user.id,
    })
  }
}

export { SelfUserTransactionQueryResolver }
