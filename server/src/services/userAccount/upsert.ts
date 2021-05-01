import { UserAccount } from '@models/userAccount'
import { UserAccountFields } from '@resolvers/userAccount/userAccount.inputs'
import { ServiceMethod } from '@services/service'

class UserAccountUpsertMethod extends ServiceMethod {
  run = async (inputs: UserAccountFields) => {
    return UserAccount.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
  }
}

export { UserAccountUpsertMethod }
