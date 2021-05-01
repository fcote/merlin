import { UserTransaction } from '@models/userTransaction'
import { UserTransactionFields } from '@resolvers/userTransaction/userTransaction.inputs'
import { ServiceMethod } from '@services/service'

class UserTransactionUpsertMethod extends ServiceMethod {
  run = async (inputs: UserTransactionFields) => {
    return UserTransaction.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
  }
}

export { UserTransactionUpsertMethod }
