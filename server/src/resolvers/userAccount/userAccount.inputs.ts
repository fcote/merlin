import { UserAccountType, UserAccountProvider } from '@models/userAccount'

class UserAccountFilters {
  types?: UserAccountType[]

  userId?: string
}

class UserAccountSyncFields {
  id: number | string

  username: string

  password: string
}

class UserAccountFields {
  id?: number | string

  name?: string

  type?: UserAccountType

  provider?: UserAccountProvider

  balance?: number

  deletedAt?: Date

  userId?: string
}

export { UserAccountFilters, UserAccountSyncFields, UserAccountFields }
