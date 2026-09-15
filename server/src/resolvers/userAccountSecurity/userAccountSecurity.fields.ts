import { UserAccountSecurity } from '@models/userAccountSecurity'
import { RequestContext } from '@typings/context'

class UserAccountSecurityFieldsResolver {
  async security(
    userAccountSecurity: UserAccountSecurity,
    ctx: RequestContext
  ) {
    return ctx.loaders!.userAccountSecuritySecurity.load(
      userAccountSecurity.securityId
    )
  }
}

export { UserAccountSecurityFieldsResolver }
