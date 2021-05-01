import dayjs from 'dayjs'
import { ref } from 'objection'
import pmap from 'p-map'

import { quoteLink } from '@links/links'
import { logger } from '@logger'
import { HistoricalPrice } from '@models/historicalPrice'
import { Security } from '@models/security'
import { HistoricalPriceService } from '@services/historicalPrice/index'
import { ServiceMethod } from '@services/service'

class HistoricalPriceSyncEndOfDayMethod extends ServiceMethod {
  protected service: HistoricalPriceService

  run = async (tickers: string[]) => {
    const currentDate = dayjs().format('YYYY-MM-DD')
    const securities = await Security.query(this.trx).whereIn('ticker', tickers)
    const historicalPrices = await this.lastHistoricalPrices(securities)
    const quotes = await quoteLink.batchQuotes(tickers)

    return pmap(
      securities,
      async (security) => {
        const quote = quotes.find((q) => q.symbol === security.ticker)
        if (!quote) {
          logger.info('historicalPrices > syncEndOfDay > missing quote', {
            ticker: security.ticker,
          })
          return
        }

        const existingHistoricalPrice = historicalPrices.find(
          (hp) => hp.securityId === security.id && hp.date === currentDate
        )

        return HistoricalPrice.query(this.trx).upsertGraph({
          ...(existingHistoricalPrice && { id: existingHistoricalPrice.id }),
          date: currentDate,
          open: quote.open,
          low: quote.dayLow,
          high: quote.dayHigh,
          close: quote.price,
          change: quote.dayChange,
          changePercent: quote.dayChangePercent,
          volume: quote.volume / 1e6,
          securityId: security.id,
        })
      },
      { concurrency: 10 }
    )
  }

  lastHistoricalPrices = (securities: Security[]) => {
    return HistoricalPrice.query(this.trx)
      .select('id', 'date', 'securityId')
      .where(
        'historical_prices.id',
        HistoricalPrice.query(this.trx)
          .alias('h')
          .select('h.id')
          .where('h.securityId', ref('historical_prices.securityId'))
          .orderBy('h.date', 'desc')
          .limit(1)
      )
      .whereIn(
        'historical_prices.securityId',
        securities.map((s) => s.id)
      )
  }
}

export { HistoricalPriceSyncEndOfDayMethod }
