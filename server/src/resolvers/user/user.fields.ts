import dayjs, { Dayjs } from 'dayjs'
import GraphQLJSON from 'graphql-type-json'
import { sumBy, range } from 'lodash'
import {
  Ctx,
  FieldResolver,
  Resolver,
  Root,
  Arg,
  Float,
  Int,
} from 'type-graphql'

import { User, UserMonthlyExpenses } from '@models/user'
import { PaginatedUserAccount } from '@models/userAccount'
import { PaginatedUserAccountSecurity } from '@models/userAccountSecurity'
import {
  PaginatedUserTransaction,
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

@Resolver(User)
class UserFieldsResolver {
  @FieldResolver((_) => PaginatedUserTransaction)
  async transactions(
    @Root() user: User,
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => UserTransactionFilters, { nullable: true })
    filters?: UserTransactionFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedUserTransaction> {
    return ctx.loaders.userTransactions.load({
      userId: user.id,
      filters,
      paginate,
      orderBy,
    })
  }

  @FieldResolver((_) => PaginatedUserAccount)
  async accounts(
    @Root() user: User,
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => UserAccountFilters, { nullable: true })
    filters?: UserAccountFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedUserAccount> {
    return ctx.loaders.userAccounts.load({
      userId: user.id,
      filters,
      paginate,
      orderBy,
    })
  }

  @FieldResolver((_) => PaginatedUserAccountSecurity)
  async accountSecurities(
    @Root() user: User,
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => UserAccountSecurityFilters, { nullable: true })
    filters?: UserAccountSecurityFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedUserAccountSecurity> {
    return new UserAccountSecurityService(ctx).find(
      {
        ...filters,
        userId: user.id,
      },
      paginate,
      orderBy
    )
  }

  @FieldResolver((_) => GraphQLJSON)
  async monthlyForecast(
    @Root() user: User,
    @Ctx() ctx: RequestContext,
    @Arg('nMonth', (_) => Int) nMonth: number
  ): Promise<any> {
    const currentDate = () => {
      return dayjs().startOf('month').add(1, 'day')
    }

    const userTransactionService = new UserTransactionService(ctx)
    const userAccountService = new UserAccountService(ctx)

    const {
      left: incomeLeftPerMonth,
    } = await userTransactionService.monthlyExpenses(user.id)
    const currentTotalBalance = await userAccountService.totalBalance(user.id)

    const transactions = await userTransactionService.find(
      {
        userId: user.id,
        frequencies: [UserTransactionFrequency.punctual],
      },
      null,
      null
    )

    const getTotal = (forecastDate: Dayjs, type: UserTransactionType) => {
      const trs = transactions.nodes.filter(
        (t) => dayjs(t.date).isSame(forecastDate, 'month') && t.type === type
      )
      return sumBy(trs, (t) => t.value)
    }

    return range(1, nMonth).reduce((result, n) => {
      const forecastDate = currentDate().add(n - 1, 'month')
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
        currentTotalBalance + incomeLeftPerMonth * n + totalExtras

      result[forecastDate.format('YYYY-MM-DD')] = {
        balance: forecastedBalance,
        extras: totalExtras,
      }

      return result
    }, {} as Record<string, Record<string, number>>)
  }

  @FieldResolver((_) => UserMonthlyExpenses)
  async monthlyExpenses(
    @Root() user: User,
    @Ctx() ctx: RequestContext
  ): Promise<UserMonthlyExpenses> {
    return new UserTransactionService(ctx).monthlyExpenses(user.id)
  }

  @FieldResolver((_) => Float)
  async accountTotalBalance(
    @Root() user: User,
    @Ctx() ctx: RequestContext
  ): Promise<number> {
    return new UserAccountService(ctx).totalBalance(user.id)
  }

  @FieldResolver((_) => Float)
  incomePerMonthBeforeTaxes(@Root() user: User): number {
    return user.incomePerMonthBeforeTaxes
  }

  @FieldResolver((_) => Float)
  netIncomePerMonth(@Root() user: User): number {
    return user.netIncomePerMonth
  }
}

export { UserFieldsResolver }
