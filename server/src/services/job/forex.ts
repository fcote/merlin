import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { forexLink } from '@links/links'
import { logger } from '@logger'
import { ForexService } from '@services/forex'
import { ServiceMethod } from '@services/service'

class JobForexMethod extends ServiceMethod {
  run = async (): Promise<void> => {
    const forexExchangeRates = (await forexLink.exchangeRates()).filter(
      (f) => f.from && f.to
    )

    await pmap(
      forexExchangeRates,
      async (exchangeRate) => {
        try {
          await transaction(Model.knex(), async (trx) => {
            return new ForexService({ ...this.ctx, trx }).sync(exchangeRate)
          })
        } catch (err) {
          logger.error('job > forex > failed to sync forex', {
            err,
            exchangeRate,
          })
        }
      },
      { concurrency: 10 }
    )
  }
}

export { JobForexMethod }
