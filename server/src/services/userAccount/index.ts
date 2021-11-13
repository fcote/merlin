import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import {
  UserAccountFields,
  UserAccountSyncFields,
  UserAccountFilters,
} from '@resolvers/userAccount/userAccount.inputs'
import { Service } from '@services/service'
import { UserAccountFindMethod } from '@services/userAccount/find'
import { UserAccountFindRelationsMethod } from '@services/userAccount/findRelations'
import { UserAccountSyncMethod } from '@services/userAccount/sync'
import { UserAccountTotalBalanceMethod } from '@services/userAccount/totalBalance'
import { UserAccountUpsertMethod } from '@services/userAccount/upsert'

class UserAccountService extends Service {
  upsert = async (inputs: UserAccountFields) =>
    new UserAccountUpsertMethod(this).run(inputs)
  sync = async (inputs: UserAccountSyncFields) =>
    new UserAccountSyncMethod(this).run(inputs)

  find = async (
    filters?: UserAccountFilters | undefined,
    paginate?: PaginationOptions | undefined,
    orderBy?: OrderOptions[] | undefined
  ) => new UserAccountFindMethod(this).run(filters, paginate, orderBy)
  findRelations = (
    relationKey: string,
    keys: (string | number)[],
    filters?: UserAccountFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) =>
    new UserAccountFindRelationsMethod(this).run(
      relationKey,
      keys,
      filters,
      paginate,
      orderBy
    )
  totalBalance = async (userId: string) =>
    new UserAccountTotalBalanceMethod(this).run(userId)
}

export { UserAccountService }
