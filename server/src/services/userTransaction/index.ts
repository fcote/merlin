import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import {
  UserTransactionFilters,
  UserTransactionFields,
} from '@resolvers/userTransaction/userTransaction.inputs'
import { Service } from '@services/service'
import { UserTransactionFindMethod } from '@services/userTransaction/find'
import { UserTransactionFindRelationsMethod } from '@services/userTransaction/findRelations'
import { UserTransactionMonthlyExpensesMethod } from '@services/userTransaction/monthlyExpenses'
import { UserTransactionUpsertMethod } from '@services/userTransaction/upsert'

class UserTransactionService extends Service {
  upsert = async (inputs: UserTransactionFields) =>
    new UserTransactionUpsertMethod(this).run(inputs)

  find = async (
    filters: UserTransactionFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ) => new UserTransactionFindMethod(this).run(filters, paginate, orderBy)
  findRelations = (
    relationKey: string,
    keys: (string | number)[],
    filters: UserTransactionFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ) =>
    new UserTransactionFindRelationsMethod(this).run(
      relationKey,
      keys,
      filters,
      paginate,
      orderBy
    )
  monthlyExpenses = async (userId: string) =>
    new UserTransactionMonthlyExpensesMethod(this).run(userId)
}

export { UserTransactionService }
