import { Security } from '@lib/security'

export enum EarningTime {
  beforeMarketOpen = 'beforeMarketOpen',
  afterMarketClose = 'afterMarketClose',
}

export const EarningTimeLabel = {
  [EarningTime.beforeMarketOpen]: 'Before market open',
  [EarningTime.afterMarketClose]: 'After market close',
}

export const EarningTimeAbbreviation = {
  [EarningTime.beforeMarketOpen]: 'BMO',
  [EarningTime.afterMarketClose]: 'AMC',
}

export type EarningStatement = {
  speaker: string
  statement: string
}

export type Earning = {
  id: string
  date: string
  fiscalYear?: number
  fiscalQuarter?: number
  time: EarningTime
  epsEstimate?: number
  eps?: number
  epsSurprisePercent?: number
  revenueEstimate?: number
  revenue?: number
  revenueSurprisePercent?: number
  security?: Security
}
