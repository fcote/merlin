import { sumBy } from 'lodash'

import { UserMonthlyExpenses } from '@models/user'
import {
  UserTransaction,
  UserTransactionFrequency,
  UserTransactionCategory,
  UserTransactionType,
} from '@models/userTransaction'
import { ServiceMethod } from '@services/service'

class UserTransactionMonthlyExpensesMethod extends ServiceMethod {
  run = async (userId: string) => {
    const sums = ((await UserTransaction.query(this.trx)
      .sum('value')
      .select('category')
      .where('userId', userId)
      .where('type', UserTransactionType.expense)
      .where('frequency', UserTransactionFrequency.monthly)
      .groupBy('category')) as unknown) as {
      sum: number
      category: UserTransactionCategory
    }[]

    const total = sumBy(sums, (s) => s.sum)
    const left = this.ctx.user.netIncomePerMonth - total
    const categorySums = sums.reduce((result, value) => {
      result[value.category] = value.sum
      return result
    }, {} as Record<UserTransactionCategory, number>)

    return {
      total,
      left,
      ...categorySums,
    } as UserMonthlyExpenses
  }
}

export { UserTransactionMonthlyExpensesMethod }
