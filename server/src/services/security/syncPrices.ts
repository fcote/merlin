import pmap from 'p-map'

import { dayjs } from '@helpers/dayjs'
import { quoteLink, extendedHoursQuotesLink } from '@links/links'
import { SecurityQuoteResult } from '@links/types'
import { HistoricalPrice } from '@models/historicalPrice'
import { Security } from '@models/security'
import { SecurityService } from '@services/security/index'
import { SecuritySyncEmitter } from '@services/security/sync'
import { ServiceMethod } from '@services/service'

class SecuritySyncPricesMethod extends ServiceMethod {
  protected service: SecurityService

  run = async (tickers: string[], syncEmitter?: SecuritySyncEmitter) => {
    let securities = await Security.query(this.trx).whereIn('ticker', tickers)
    const lastWeekPrices = await this.lastWeekPrices(securities)
    const quotes = await quoteLink.batchQuotes(tickers)
    const extendedHoursQuotes =
      (await extendedHoursQuotesLink?.batchQuotes(tickers)) ?? []

    securities = await pmap(
      securities,
      async (security) => {
        const quote = quotes.find((q) => q.symbol === security.ticker)
        const extendedHoursQuote = extendedHoursQuotes.find(
          (q) => q.symbol === security.ticker
        )
        const lastWeekPrice = lastWeekPrices.find(
          (p) => p.securityId === security.id
        )
        const weekChangeQuote = this.getWeekChangeQuote(quote, lastWeekPrice)

        const quoteUpdate = Security.getPriceUpdateFromQuote({
          ...extendedHoursQuote,
          ...weekChangeQuote,
          ...quote,
        })
        return security.$query(this.trx).patchAndFetch(quoteUpdate)
      },
      { concurrency: 10 }
    )

    syncEmitter?.sendProgress(0.2)

    return securities
  }

  private getWeekChangeQuote = (
    quote?: SecurityQuoteResult,
    lastWeekPrice?: HistoricalPrice
  ) => {
    if (!lastWeekPrice || !quote?.price) return null

    return {
      weekChange: quote.price - lastWeekPrice.close,
      weekChangePercent:
        ((quote.price - lastWeekPrice.close) / Math.abs(lastWeekPrice.close)) *
        100,
    }
  }

  private lastWeekPrices = async (securities: Security[]) => {
    const lastFriday = dayjs().isoWeekday(-2)
    return HistoricalPrice.query(this.trx)
      .select('id', 'close', 'securityId')
      .whereIn(
        'securityId',
        securities.map((s) => s.id)
      )
      .where('date', lastFriday.format('YYYY-MM-DD'))
  }
}

export { SecuritySyncPricesMethod }
