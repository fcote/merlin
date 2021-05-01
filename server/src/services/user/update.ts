import { User } from '@models/user'
import { UserFields } from '@resolvers/user/user.inputs'
import { ServiceMethod } from '@services/service'

class UserUpdateMethod extends ServiceMethod {
  run = async (inputs: UserFields) => {
    return User.query(this.trx).withArchived(true).upsertGraphAndFetch(inputs)
  }
}

export { UserUpdateMethod }
