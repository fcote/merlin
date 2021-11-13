import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Company } from '@models/company'
import { Security } from '@models/security'
import { RequestContext } from '@typings/context'

@Resolver(Security)
class SecurityFieldsResolver {
  @FieldResolver((_) => Company, { nullable: true })
  async company(@Root() security: Security, @Ctx() ctx: RequestContext) {
    if (!security.companyId) return
    return ctx.loaders!.securityCompany.load(security.companyId)
  }

  @FieldResolver((_) => String, { nullable: true })
  async followedIn(@Root() security: Security, @Ctx() ctx: RequestContext) {
    return ctx.loaders!.securityFollowedIn.load(security.id)
  }
}

export { SecurityFieldsResolver }
