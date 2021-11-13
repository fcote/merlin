import { User } from '@models/user'
import { UserFilters } from '@resolvers/user/user.inputs'
import { ServiceMethod } from '@services/service'

class UserFindOneMethod extends ServiceMethod {
  run = async (filters: UserFilters) => {
    if (!filters.apiToken && !filters.username && !filters.userId) return null

    const query = User.query(this.trx)

    if (filters.userId) {
      return query.findOne('id', filters.userId)
    }

    if (filters.apiToken) {
      return query.findOne('apiToken', filters.apiToken)
    }

    if (filters.username) {
      return query.findOne('username', filters.username)
    }

    return
  }
}

export { UserFindOneMethod, UserFilters }
