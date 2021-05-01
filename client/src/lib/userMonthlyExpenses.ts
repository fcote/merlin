import { UserTransactionCategory } from '@lib/userTransaction'

export default interface UserMonthlyExpenses {
  total: number
  left: number
  [UserTransactionCategory.extra]: number
  [UserTransactionCategory.groceries]: number
  [UserTransactionCategory.rent]: number
  [UserTransactionCategory.subscription]: number
}

export enum UserMonthlyExpensesItemLabel {
  total = 'Expenses per month',
  left = 'Left per month',
  extra = 'Extras',
  groceries = 'Groceries',
  rent = 'Rent',
  subscription = 'Subscriptions',
}
