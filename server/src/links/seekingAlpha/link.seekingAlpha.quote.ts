import { isNull } from 'lodash'

import {
  SeekingAlphaQuote,
  SeekingAlphaLink,
} from '@links/seekingAlpha/link.seekingAlpha'
import { SecurityQuoteResult } from '@links/types'
import { logger } from '@logger'
import { SecurityMarketStatus } from '@models/security'

const getMarketStatus = (
  quote: SeekingAlphaQuote
): SecurityMarketStatus | null => {
  switch (quote.ext_market) {
    case 'pre':
      return SecurityMarketStatus.preMarket
    case 'post':
      return SecurityMarketStatus.afterHours
    default:
      return null
  }
}

const toSecurityQuoteResult = (
  quote: SeekingAlphaQuote
): SecurityQuoteResult => {
  const quotePrice = quote.ext_price
  const quoteChangePercent = (quote.ext_price / quote.last - 1) * 100
  const marketStatus = getMarketStatus(quote)

  const base: Partial<SecurityQuoteResult> = isNull(marketStatus)
    ? { extendedHoursPrice: null, extendedHoursChangePercentage: null }
    : {
        extendedHoursPrice: quotePrice,
        extendedHoursChangePercentage: quoteChangePercent,
      }

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
