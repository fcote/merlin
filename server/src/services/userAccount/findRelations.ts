import { PaginatedUserAccount, UserAccount } from '@models/userAccount'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { ServiceMethod } from '@services/service'
import { UserAccountFindMethod } from '@services/userAccount/find'

class UserAccountFindRelationsMethod extends ServiceMethod {
  run = async (
    groupBy: string,
    keys: (string | number)[],
    filters: UserAccountFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<PaginatedUserAccount[]> => {
    return UserAccount.paginateRelation(
      UserAccountFindMethod.applyFilters(UserAccount.query(this.trx), filters),
      paginate,
      orderBy,
      groupBy,
      keys
    )
  }
}

export { UserAccountFindRelationsMethod }
