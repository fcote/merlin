import { UserAccountSecurity } from '@models/userAccountSecurity'
import { ServiceMethod } from '@services/service'

class UserAccountSecurityLinkMethod extends ServiceMethod {
  run = async (
    userAccountSecurityId: string | number,
    securityId: string | number
  ) => {
    return UserAccountSecurity.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch({
        id: userAccountSecurityId,
        securityId,
      })
      .withGraphFetched('[security, userAccount]')
  }
}

export { UserAccountSecurityLinkMethod }
