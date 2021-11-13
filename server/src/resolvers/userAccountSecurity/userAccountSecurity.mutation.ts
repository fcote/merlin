import { Ctx, FieldResolver, Resolver, Arg, Authorized } from 'type-graphql'

import { UserAccountSecurity } from '@models/userAccountSecurity'
import { Right } from '@resolvers'
import { SelfMutation } from '@resolvers/root'
import { UserAccountSecurityFields } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { RequestContext } from '@typings/context'

@Resolver(SelfMutation)
class SelfUserAccountSecurityQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => UserAccountSecurity)
  async upsertUserAccountSecurity(
    @Arg('inputs', (_) => UserAccountSecurityFields)
    inputs: UserAccountSecurityFields,
    @Ctx() ctx: RequestContext
  ) {
    await UserAccountSecurity.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new UserAccountSecurityService(ctx).upsert({
      ...inputs,
    })
  }
}

export { SelfUserAccountSecurityQueryResolver }
