import { UserAccountSecurity } from '@models/userAccountSecurity'
import { UserAccountSecurityFields } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { ServiceMethod } from '@services/service'

class UserAccountSecurityUpsertMethod extends ServiceMethod {
  run = async (inputs: UserAccountSecurityFields) => {
    return UserAccountSecurity.query(this.trx).upsertGraphAndFetch(inputs, {
      relate: true,
      noDelete: true,
    })
  }
}

export { UserAccountSecurityUpsertMethod }
