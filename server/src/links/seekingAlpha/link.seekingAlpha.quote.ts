import {
  SeekingAlphaQuote,
  SeekingAlphaLink,
} from '@links/seekingAlpha/link.seekingAlpha'
import { SecurityQuoteResult } from '@links/types'
import { logger } from '@logger'
import { SecurityMarketStatus } from '@models/security'

const getMarketStatus = (quote: SeekingAlphaQuote): SecurityMarketStatus => {
  switch (quote.ext_market) {
    case 'pre':
      return SecurityMarketStatus.preMarket
    case 'post':
      return SecurityMarketStatus.afterHours
  }
}

const toSecurityQuoteResult = (
  quote: SeekingAlphaQuote
): SecurityQuoteResult => {
  const quotePrice = quote.ext_price
  const quoteChangePercent = (quote.ext_price / quote.last - 1) * 100
  const marketStatus = getMarketStatus(quote)

  const base: Partial<SecurityQuoteResult> = [
    SecurityMarketStatus.afterHours,
    SecurityMarketStatus.preMarket,
  ].includes(marketStatus)
    ? {
        extendedHoursPrice: quotePrice,
        extendedHoursChangePercentage: quoteChangePercent,
      }
    : { extendedHoursPrice: null, extendedHoursChangePercentage: null }

  return {
    symbol: quote.symbol,
    marketStatus,
    ...base,
  }
}

async function seekingAlphaQuote(this: SeekingAlphaLink, ticker: string) {
  const response = await this.batchQuotes([ticker])
  return response?.shift()
}

async function seekingAlphaBatchQuotes(
  this: SeekingAlphaLink,
  tickers: string[]
) {
  const response = await this.query<{ real_time_quotes: SeekingAlphaQuote[] }>(
    this.getEndpoint(`/real_time_quotes?sa_slugs=${tickers.join(',')}`)
  )
  if (!response?.real_time_quotes) {
    logger.warn('seekingAlpha > could not fetch security quote')
    return []
  }

  return response.real_time_quotes.map(toSecurityQuoteResult)
}

export { seekingAlphaQuote, seekingAlphaBatchQuotes }
