import { Earning } from '@models/earning'
import { RequestContext } from '@typings/context'

class EarningFieldsResolver {
  async security(earning: Earning, ctx: RequestContext) {
    return ctx.loaders!.earningSecurity.load(earning.securityId)
  }
}

export { EarningFieldsResolver }
