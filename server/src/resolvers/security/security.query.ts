import { searchLink } from '@links/links'
import { SecurityService } from '@services/security'
import { RequestContext } from '@typings/context'

class SecurityQueryResolver {
  searchSecurity(ticker: string) {
    return searchLink.search(ticker)
  }

  security(ticker: string, ctx: RequestContext) {
    return new SecurityService(ctx).findOne({ ticker })
  }
}

export { SecurityQueryResolver }
