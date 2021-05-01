import { ForexExchangeRateResult } from '@links/types'
import { Forex } from '@models/forex'
import { ServiceMethod } from '@services/service'

class ForexSyncMethod extends ServiceMethod {
  run = async (inputs: ForexExchangeRateResult) => {
    const existingForexExchangeRate = await Forex.query(this.trx).findOne({
      fromCurrency: inputs.from,
      toCurrency: inputs.to,
    })

    return Forex.query(this.trx).upsertGraphAndFetch({
      ...(existingForexExchangeRate && { id: existingForexExchangeRate.id }),
      fromCurrency: inputs.from,
      toCurrency: inputs.to,
      exchangeRate: inputs.price,
    })
  }
}

export { ForexSyncMethod }
