import { Financial } from '@lib/financial'

import { Company } from './company'
import { Exchange } from './exchange'

export enum SecurityType {
  commonStock = 'Common stock',
  index = 'Index',
  etf = 'ETF',
  mutualFund = 'Mutual fund',
}

export enum SecurityMarketStatus {
  open = 'open',
  closed = 'closed',
  preMarket = 'preMarket',
  afterHours = 'afterHours',
}

export const SecurityMarketStatusLabel = {
  [SecurityMarketStatus.open]: 'Open',
  [SecurityMarketStatus.closed]: 'Closed',
  [SecurityMarketStatus.preMarket]: 'PM',
  [SecurityMarketStatus.afterHours]: 'AH',
}

export type Security = {
  id: string
  ticker: string
  currency?: string
  type: keyof typeof SecurityType
  marketStatus?: SecurityMarketStatus

  currentPrice?: number
  dayChange?: number
  dayChangePercent?: number
  weekChange?: number
  weekChangePercent?: number
  extendedHoursPrice?: number
  extendedHoursChangePercent?: number
  high52Week?: number
  low52Week?: number
  marketCapitalization?: number
  sharesOutstanding?: number

  exchangeId: string
  companyId: string

  exchange: Exchange
  company: Company
  financials: Financial[]
}

export type SecurityPriceChange = Pick<
  Security,
  | 'id'
  | 'ticker'
  | 'marketStatus'
  | 'currentPrice'
  | 'dayChangePercent'
  | 'dayChange'
  | 'weekChangePercent'
  | 'weekChange'
  | 'extendedHoursPrice'
  | 'extendedHoursChangePercent'
>

export type SecuritySyncProgressChange = {
  ticker: string
  progress: number
}
