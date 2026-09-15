import { SecurityService } from '@services/security'
import { RequestContext } from '@typings/context'

class SecurityMutationResolver {
  async syncSecurity(ticker: string, ctx: RequestContext) {
    const result = await new SecurityService(ctx).sync({ ticker })
    return result.security
  }

  async syncSecurityPrices(tickers: string[], ctx: RequestContext) {
    return new SecurityService(ctx).syncPrices(tickers)
  }
}

export { SecurityMutationResolver }
