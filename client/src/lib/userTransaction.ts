export enum UserTransactionCategory {
  rent = 'rent',
  groceries = 'groceries',
  extra = 'extra',
  subscription = 'subscription',
}

export enum UserTransactionType {
  expense = 'expense',
  income = 'income',
}

export enum UserTransactionFrequency {
  monthly = 'monthly',
  punctual = 'punctual',
}

export default interface UserTransaction {
  id?: string
  name: string
  value: number
  date: string
  category: UserTransactionCategory
  type: UserTransactionType
  frequency: UserTransactionFrequency
  deletedAt?: string
}
