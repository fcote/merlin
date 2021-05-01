import { EarningTime } from '@models/earning'
import { FinancialPeriod } from '@models/financial'
import {
  FinancialUnitType,
  FinancialStatement,
  FinancialUnit,
  FinancialItemDirection,
} from '@models/financialItem'
import { NewsType } from '@models/news'
import { SecurityType, SecurityMarketStatus } from '@models/security'

export type SecuritySearchResult = {
  ticker: string
  name: string
  securityType: SecurityType
}

export type SecurityListResult = {
  ticker: string
  name: string
}

export type SecurityQuoteResult = {
  symbol: string
  price?: number
  open?: number
  dayLow?: number
  dayHigh?: number
  volume?: number
  dayChange?: number
  dayChangePercent?: number
  weekChange?: number
  weekChangePercent?: number
  extendedHoursPrice?: number
  extendedHoursChangePercentage?: number
  high52w?: number
  low52w?: number
  marketCap?: number
  sharesOutstanding?: number
  securityType?: SecurityType
  marketStatus?: SecurityMarketStatus
}

export type SecurityCompanyOverviewResult = {
  symbol: string
  cik: string
  isin: string
  cusip: string
  name: string
  currency: string
  description: string
  sector: string
  industry: string
  address: string
  employees: number
  securityType?: SecurityType
}

export type SecurityFinancialResult = SecurityFinancialBaseResult & {
  slug: string
  statement: FinancialStatement
  reportDate: string
  period?: FinancialPeriod
  value: number
}

export type SecurityFinancialBaseResult = {
  label: string
  unitType?: FinancialUnitType
  unit?: FinancialUnit
  isMain: boolean
  index: number
  latexDescription?: string
  direction?: FinancialItemDirection
}

export type SecurityHistoricalPriceResult = {
  date: string
  open: number
  high: number
  low: number
  close: number
  adjustedClose?: number
  volume: number
  unadjustedVolume?: number
  change: number
  changePercent: number
  volumeWeightedAveragePrice?: number
  label?: string
}

export type SecurityEarningResult = {
  date: string
  fiscalYear?: number
  fiscalQuarter?: number
  time?: EarningTime
  epsEstimate?: number
  eps?: number
  revenueEstimate?: number
  revenue?: number
  epsSurprisePercent?: number
  revenueSurprisePercent?: number
}

export type SecurityNewsResult = {
  ticker: string
  type: NewsType
  date: Date
  title: string
  content: string
  website?: string
  url?: string
}

export type ForexExchangeRateResult = {
  from: string
  to: string
  price: number
}
