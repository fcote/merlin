import { UserTransaction } from '@models/userTransaction'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { UserTransactionFilters } from '@resolvers/userTransaction/userTransaction.inputs'
import { ServiceMethod } from '@services/service'
import { UserTransactionFindMethod } from '@services/userTransaction/find'

class UserTransactionFindRelationsMethod extends ServiceMethod {
  run = async (
    groupBy: string,
    keys: readonly (string | number)[],
    filters?: UserTransactionFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) => {
    return UserTransaction.paginateRelation(
      UserTransactionFindMethod.applyFilters(
        UserTransaction.query(this.trx),
        filters
      ),
      groupBy,
      keys,
      paginate,
      orderBy
    )
  }
}

export { UserTransactionFindRelationsMethod }
