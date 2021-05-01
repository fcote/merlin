export enum UserAccountType {
  saving = 'saving',
  securities = 'securities',
}

export enum UserAccountProvider {
  xtb = 'xtb',
}

export default interface UserAccount {
  id: string
  name: string
  type: UserAccountType
  provider: UserAccountProvider
  balance: number
  userId: string
  deletedAt?: string
}
