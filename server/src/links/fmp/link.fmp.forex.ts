import { FMPLink } from '@links/fmp/link.fmp'
import { FMPQuote } from '@links/fmp/link.fmp.quote'
import { ForexExchangeRateResult } from '@links/types'
import { logger } from '@logger'

const toForexExchangeRateResult = (
  item: FMPQuote
): ForexExchangeRateResult => ({
  from: item.name.split('/')[0],
  to: item.name.split('/')[1],
  price: item.price,
})

async function fmpExchangeRates(
  this: FMPLink
): Promise<ForexExchangeRateResult[]> {
  const quotes = await this.query<FMPQuote[]>(
    this.getEndpoint(`/v3/quotes/forex`)
  )
  if (!quotes?.length) {
    logger.warn('fmp > exchangeRate > could not find forex quotes')
    return null
  }
  return quotes.map(toForexExchangeRateResult)
}

export { fmpExchangeRates }
