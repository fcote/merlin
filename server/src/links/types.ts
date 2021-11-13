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
  price?: number | null
  open?: number | null
  dayLow?: number | null
  dayHigh?: number | null
  volume?: number | null
  dayChange?: number | null
  dayChangePercent?: number | null
  weekChange?: number | null
  weekChangePercent?: number | null
  extendedHoursPrice?: number | null
  extendedHoursChangePercentage?: number | null
  high52w?: number | null
  low52w?: number | null
  marketCap?: number | null
  sharesOutstanding?: number | null
  securityType?: SecurityType | null
  marketStatus?: SecurityMarketStatus | null
}

export type SecurityCompanyOverviewResult = {
  symbol: string
  cik: string
  isin: string
  cusip: string
  name: string
  currency: string
  description: string
  sector: string | null
  industry: string | null
  address: string
  employees: number
  securityType?: SecurityType
}

export type SecurityFinancialResult = SecurityFinancialBaseResult & {
  slug: string
  statement: FinancialStatement
  reportDate: string
  period?: FinancialPeriod
  isEstimate?: boolean
  value: number | null
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
  fiscalYear?: number | null
  fiscalQuarter?: number | null
  time?: EarningTime | null
  epsEstimate?: number | null
  eps?: number | null
  revenueEstimate?: number | null
  revenue?: number | null
  epsSurprisePercent?: number | null
  revenueSurprisePercent?: number | null
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
