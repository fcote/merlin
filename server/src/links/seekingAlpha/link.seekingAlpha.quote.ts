import {
  SeekingAlphaQuote,
  SeekingAlphaLink,
} from '@links/seekingAlpha/link.seekingAlpha'
import { SecurityQuoteResult } from '@links/types'
import { logger } from '@logger'
import { SecurityMarketStatus } from '@models/security'

const getMarketStatus = (quote: SeekingAlphaQuote): SecurityMarketStatus => {
  switch (quote.attributes.extendedHoursType) {
    case 'PreMarket':
      return SecurityMarketStatus.preMarket
    case 'PostMarket':
      return SecurityMarketStatus.afterHours
    default:
      return null
  }
}

const toSecurityQuoteResult = (
  quote: SeekingAlphaQuote
): SecurityQuoteResult => {
  const quotePrice = quote.attributes.extendedHoursPrice
  const quoteChangePercent = quote.attributes.extendedHoursPercentChange
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
    symbol: quote.id,
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
  const urlSymbols = tickers.map((t) => `symbols[]=${t}`).join('&')
  const response = await this.query<{ data: SeekingAlphaQuote[] }>(
    this.getEndpoint(`/real-time-prices?${urlSymbols}`)
  )
  if (!response?.data) {
    logger.warn('seekingAlpha > could not fetch security quote')
    return
  }

  return response.data.map(toSecurityQuoteResult)
}

export { seekingAlphaQuote, seekingAlphaBatchQuotes }
