import { APILink, QuoteLink } from '@links'
import {
  seekingAlphaQuote,
  seekingAlphaBatchQuotes,
} from '@links/seekingAlpha/link.seekingAlpha.quote'
import { SecurityQuoteResult } from '@links/types'

export interface SeekingAlphaQuote {
  sa_id: number
  sa_slug: string
  symbol: string
  high: number
  low: number
  open: number
  close: number
  prev_close: number
  last: number
  volume: number
  last_time: string
  market_cap: number
  ext_time: string
  ext_price: number
  ext_market: 'post' | 'pre'
  info: string
  src: string
  updated_at: string
}

class SeekingAlphaLink extends APILink implements QuoteLink {
  constructor() {
    super({
      endpoint: 'https://finance-api.seekingalpha.com',
      base: '',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      },
    })
  }

  quote = async (ticker: string): Promise<SecurityQuoteResult | undefined> => {
    return seekingAlphaQuote.bind(this, ticker)()
  }

  batchQuotes = async (tickers: string[]): Promise<SecurityQuoteResult[]> => {
    return seekingAlphaBatchQuotes.bind(this, tickers)()
  }
}

const seekingAlpha = new SeekingAlphaLink()

export { SeekingAlphaLink, seekingAlpha }
