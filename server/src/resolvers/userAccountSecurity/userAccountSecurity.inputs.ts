class UserAccountSecurityFilters {
  accountId?: string

  ticker?: string
  userId?: string
}

class UserAccountSecurityFields {
  id?: number | string

  name?: string

  volume?: number

  openPrice?: number

  openedAt?: Date

  currency?: string

  securityId?: number | string

  securityTicker?: string

  userAccountId?: number | string

  deletedAt?: Date
}

export { UserAccountSecurityFilters, UserAccountSecurityFields }
