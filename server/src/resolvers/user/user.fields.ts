import dayjs, { Dayjs } from 'dayjs'
import { sumBy, range } from 'lodash'

import { User } from '@models/user'
import {
  UserTransactionFrequency,
  UserTransactionType,
} from '@models/userTransaction'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { UserAccountSecurityFilters } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { UserTransactionFilters } from '@resolvers/userTransaction/userTransaction.inputs'
import { UserAccountService } from '@services/userAccount'
import { UserAccountSecurityService } from '@services/userAccountSecurity'
import { UserTransactionService } from '@services/userTransaction'
import { RequestContext } from '@typings/context'

class UserFieldsResolver {
  async transactions(
    user: User,
    ctx: RequestContext,

    filters?: UserTransactionFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return ctx.loaders!.userTransactions.load({
      userId: user.id,
      filters,
      paginate,
      orderBy,
    })
  }

  async accounts(
    user: User,
    ctx: RequestContext,

    filters?: UserAccountFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return ctx.loaders!.userAccounts.load({
      userId: user.id,
      filters,
      paginate,
      orderBy,
    })
  }

  async accountSecurities(
    user: User,
    ctx: RequestContext,

    filters?: UserAccountSecurityFilters,

    paginate?: PaginationOptions,

    orderBy?: OrderOptions[]
  ) {
    return new UserAccountSecurityService(ctx).find(
      {
        ...filters,
        userId: user.id,
      },
      paginate,
      orderBy
    )
  }

  async monthlyForecast(user: User, ctx: RequestContext, nMonth: number) {
    const currentDate = () => {
      return dayjs().startOf('month').hour(0).minute(0).second(0)
    }

    const userTransactionService = new UserTransactionService(ctx)
    const userAccountService = new UserAccountService(ctx)

    const { left: incomeLeftPerMonth } =
      await userTransactionService.monthlyExpenses(user.id)

    const transactions = await userTransactionService.find({
      userId: user.id,
      frequencies: [UserTransactionFrequency.punctual],
      since: currentDate().toISOString(),
    })

    const getTotal = (forecastDate: Dayjs, type: UserTransactionType) => {
      const trs = transactions.nodes.filter(
        (t) => dayjs(t.date).isSame(forecastDate, 'month') && t.type === type
      )
      return sumBy(trs, (t) => t.value)
    }

    let currentTotalBalance = await userAccountService.totalBalance(user.id)

    return range(0, nMonth - 1).reduce(
      (result, n) => {
        const forecastDate = currentDate().add(n, 'month')
        const totalExtraExpenses = getTotal(
          forecastDate,
          UserTransactionType.expense
        )
        const totalExtraIncome = getTotal(
          forecastDate,
          UserTransactionType.income
        )

        const totalExtras = -totalExtraExpenses + totalExtraIncome
        const forecastedBalance =
          currentTotalBalance + incomeLeftPerMonth + totalExtras

        result[forecastDate.format('YYYY-MM-DD')] = {
          balance: forecastedBalance,
          extras: totalExtras,
        }

        currentTotalBalance = forecastedBalance

        return result
      },
      {} as Record<string, Record<string, number>>
    )
  }

  async monthlyExpenses(user: User, ctx: RequestContext) {
    return new UserTransactionService(ctx).monthlyExpenses(user.id)
  }

  async accountTotalBalance(user: User, ctx: RequestContext) {
    return new UserAccountService(ctx).totalBalance(user.id)
  }

  incomePerMonthBeforeTaxes(user: User) {
    return user.incomePerMonthBeforeTaxes
  }

  netIncomePerMonth(user: User) {
    return user.netIncomePerMonth
  }
}

export { UserFieldsResolver }
