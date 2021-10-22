import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Company } from '@models/company'
import { Security } from '@models/security'
import { RequestContext } from '@typings/context'

@Resolver(Security)
class SecurityFieldsResolver {
  @FieldResolver((_) => Company, { nullable: true })
  async company(
    @Root() security: Security,
    @Ctx() ctx: RequestContext
  ): Promise<Company> {
    return (
      security.companyId && ctx.loaders.securityCompany.load(security.companyId)
    )
  }

  @FieldResolver((_) => String, { nullable: true })
  async followedIn(
    @Root() security: Security,
    @Ctx() ctx: RequestContext
  ): Promise<'watchlist' | 'account'> {
    return ctx.loaders.securityFollowedIn.load(security.id)
  }
}

export { SecurityFieldsResolver }
