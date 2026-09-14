import { UserAccountSecurity } from '@models/userAccountSecurity'
import { UserAccountSecurityFields } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { RequestContext } from '@typings/context'

class SelfUserAccountSecurityQueryResolver {
  async upsertUserAccountSecurity(
    inputs: UserAccountSecurityFields,
    ctx: RequestContext
  ) {
    await UserAccountSecurity.checkOwnership(inputs.id, ctx.user?.id, ctx.trx)
    return new UserAccountSecurityService(ctx).upsert({
      ...inputs,
    })
  }
}

export { SelfUserAccountSecurityQueryResolver }
