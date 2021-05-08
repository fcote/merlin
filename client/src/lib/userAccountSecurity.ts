import { Security } from './security'
import UserAccount from './userAccount'

export default interface UserAccountSecurity {
  id: string
  name: string
  profit: number
  volume: number
  openPrice: number
  openedAt: string
  currency: string

  externalId: string
  securityId?: string
  userAccountId: string

  security?: Security
  userAccount: UserAccount

  deletedAt?: string
}
