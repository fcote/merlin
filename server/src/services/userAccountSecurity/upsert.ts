import { UserAccountSecurity } from '@models/userAccountSecurity'
import { UserAccountSecurityFields } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { SecurityService } from '@services/security'
import { ServiceMethod } from '@services/service'

class UserAccountSecurityUpsertMethod extends ServiceMethod {
  run = async (inputs: UserAccountSecurityFields) => {
    if (inputs.securityTicker) {
      const securityService = new SecurityService(this.ctx)
      const security =
        (await securityService.findOne({ ticker: inputs.securityTicker })) ??
        (await securityService.sync({
          ticker: inputs.securityTicker,
        }))
      inputs.securityId = security.id
      delete inputs.securityTicker
    }

    return UserAccountSecurity.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
  }
}

export { UserAccountSecurityUpsertMethod }
