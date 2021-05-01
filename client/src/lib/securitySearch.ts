import { SecurityType } from '@lib/security'

export interface SecuritySearchInputs {
  ticker: string
}

export default interface SecuritySearch {
  name: string
  ticker: string
  securityType: SecurityType
}
