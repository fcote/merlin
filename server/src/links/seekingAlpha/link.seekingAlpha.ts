import { APILink, QuoteLink } from '@links/index'
import {
  seekingAlphaQuote,
  seekingAlphaBatchQuotes,
} from '@links/seekingAlpha/link.seekingAlpha.quote'
import { SecurityQuoteResult } from '@links/types'

interface SeekingAlphaQuoteAttributes {
  extendedHoursPrice: number
  low: number
  last: number
  open: number
  previousClose: number
  high: number
  quoteInfo: string
  change: number
  extendedHoursPercentChange: number
  percentChange: number
  low52Week: number
  sourceAPI: string
  high52Week: number
  percentChangeFromPreviousClose: number
  extendedHoursDateTime: string
  close: number
  extendedHoursType: 'PostMarket' | 'PreMarket'
  identifier: string
  extendedHoursChange: number
  dateTime: string
  volume: number
  name: string
  changeFromPreviousClose: number
}

export interface SeekingAlphaQuote {
  id: string
  attributes: SeekingAlphaQuoteAttributes
}

class SeekingAlphaLink extends APILink implements QuoteLink {
  constructor() {
    super({
      endpoint: 'https://finance.api.seekingalpha.com',
      base: '/v2',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      },
    })
  }

  quote = async (ticker: string): Promise<SecurityQuoteResult> => {
    return seekingAlphaQuote.bind(this, ticker)()
  }

  batchQuotes = async (tickers: string[]): Promise<SecurityQuoteResult[]> => {
    return seekingAlphaBatchQuotes.bind(this, tickers)()
  }
}

const seekingAlpha = new SeekingAlphaLink()

export { SeekingAlphaLink, seekingAlpha }
