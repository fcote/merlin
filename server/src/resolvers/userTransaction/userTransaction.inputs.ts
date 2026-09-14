import {
  UserTransactionCategory,
  UserTransactionType,
  UserTransactionFrequency,
} from '@models/userTransaction'

class UserTransactionFilters {
  since?: string

  categories?: UserTransactionCategory[]

  types?: UserTransactionType[]

  frequencies?: UserTransactionFrequency[]

  userId?: string
}

class UserTransactionFields {
  id?: number | string

  name?: string

  value?: number

  category?: UserTransactionCategory

  type?: UserTransactionType

  frequency?: UserTransactionFrequency

  date?: string

  deletedAt?: Date

  userId: string
}

export { UserTransactionFilters, UserTransactionFields }
