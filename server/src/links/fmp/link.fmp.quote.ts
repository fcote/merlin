import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityQuoteResult } from '@links/types'
import { logger } from '@logger'
import { SecurityType } from '@models/security'

export interface FMPQuote {
  symbol: string
  name: string
  price: number
  changesPercentage: number
  change: number
  dayLow: number
  dayHigh: number
  yearHigh: number
  yearLow: number
  marketCap: number
  priceAvg50: number
  priceAvg200: number
  volume: number
  avgVolume: number
  exchange: string
  open: number
  previousClose: number
  eps: number
  pe: number
  earningsAnnouncement: number
  sharesOutstanding: number
  timestamp: number
  securityType: SecurityType
}

const toSecurityQuoteResult = (quote: FMPQuote): SecurityQuoteResult => ({
  symbol: quote.symbol,
  price: quote.price,
  open: quote.open,
  dayLow: quote.dayLow,
  dayHigh: quote.dayHigh,
  volume: quote.volume,
  dayChange: quote.change,
  dayChangePercent: quote.changesPercentage,
  high52w: quote.yearHigh,
  low52w: quote.yearLow,
  marketCap: quote.marketCap,
  sharesOutstanding: quote.sharesOutstanding,
  securityType: FMPLink.getSecurityType(quote),
})

async function fmpQuote(
  this: FMPLink,
  ticker: string
): Promise<SecurityQuoteResult | undefined> {
  const response = await this.batchQuotes([ticker])
  return response?.shift()
}

async function fmpBatchQuotes(
  this: FMPLink,
  tickers: string[]
): Promise<SecurityQuoteResult[]> {
  const response = await this.query<FMPQuote[]>(
    this.getEndpoint(`/v3/quote/${tickers.join(',')}`)
  )
  if (!response?.length) {
    logger.warn('fmp > could not fetch security quote', { tickers })
    return []
  }
  return response.map(toSecurityQuoteResult)
}

export { fmpQuote, fmpBatchQuotes }
