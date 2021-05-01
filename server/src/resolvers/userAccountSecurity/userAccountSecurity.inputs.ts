import { Field, InputType } from 'type-graphql'

@InputType('UserAccountSecurityFilters')
class UserAccountSecurityFilters {
  @Field((_) => String)
  accountId?: string
  userId?: string
}

interface UserAccountSecurityFields {
  id: number | string
  name: string
  profit: number
  volume: number
  openPrice: number
  userAccountId: number | string
}

export { UserAccountSecurityFilters, UserAccountSecurityFields }
