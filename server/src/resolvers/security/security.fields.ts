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
}

export { SecurityFieldsResolver }
