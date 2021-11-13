import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Security } from '@models/security'
import { UserAccountSecurity } from '@models/userAccountSecurity'
import { RequestContext } from '@typings/context'

@Resolver(UserAccountSecurity)
class UserAccountSecurityFieldsResolver {
  @FieldResolver((_) => Security)
  async security(
    @Root() userAccountSecurity: UserAccountSecurity,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.loaders!.userAccountSecuritySecurity.load(
      userAccountSecurity.securityId
    )
  }
}

export { UserAccountSecurityFieldsResolver }
