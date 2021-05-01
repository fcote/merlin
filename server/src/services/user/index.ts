import { UserFields } from '@resolvers/user/user.inputs'
import { Service } from '@services/service'
import { UserCreateMethod } from '@services/user/create'
import { UserFindOneMethod, UserFilters } from '@services/user/findOne'
import { UserUpdateMethod } from '@services/user/update'

class UserService extends Service {
  findOne = async (filters: UserFilters) =>
    new UserFindOneMethod(this).run(filters)
  create = async (username: string, password: string) =>
    new UserCreateMethod(this).run(username, password)
  update = async (inputs: UserFields) => new UserUpdateMethod(this).run(inputs)
}

export { UserService }
