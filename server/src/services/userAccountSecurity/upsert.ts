import { UserAccountSecurity } from '@models/userAccountSecurity'
import { UserAccountSecurityFields } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { SecurityService } from '@services/security'
import { ServiceMethod } from '@services/service'
import { ApolloBadRequest } from '@typings/errors/apolloErrors'
import { DefaultErrorCodes } from '@typings/errors/errorCodes'

class UserAccountSecurityUpsertMethod extends ServiceMethod {
  run = async (inputs: UserAccountSecurityFields) => {
    if (inputs.securityTicker) {
      const securityService = new SecurityService(this.ctx)
      let security = await securityService.findOne({
        ticker: inputs.securityTicker,
      })
      if (!security) {
        security = (
          await securityService.sync({
            ticker: inputs.securityTicker,
          })
        )?.security
      }
      if (!security) {
        throw new ApolloBadRequest(DefaultErrorCodes.BAD_REQUEST, {
          ticker: inputs.securityTicker,
        })
      }
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
