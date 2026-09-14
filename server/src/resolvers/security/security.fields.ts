import { Security } from '@models/security'
import { RequestContext } from '@typings/context'

class SecurityFieldsResolver {
  async company(security: Security, ctx: RequestContext) {
    if (!security.companyId) return
    return ctx.loaders!.securityCompany.load(security.companyId)
  }

  async followedIn(security: Security, ctx: RequestContext) {
    return ctx.loaders!.securityFollowedIn.load(security.id)
  }
}

export { SecurityFieldsResolver }
