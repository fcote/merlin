import { chunk } from 'lodash'
import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { logger } from '@logger'
import { Security } from '@models/security'
import { HistoricalPriceService } from '@services/historicalPrice'
import { ServiceMethod } from '@services/service'

class JobHistoricalPricesEndOfDayMethod extends ServiceMethod {
  private batchSize: number = 500

  run = async (): Promise<void> => {
    const securities = await Security.query().select('id', 'ticker')
    const securityChunks = chunk(securities, this.batchSize)

    await pmap(
      securityChunks,
      async (securityChunk, chunkIndex) => {
        const securityTickers = securityChunk.map((s) => s.ticker)
        const index = chunkIndex * this.batchSize + securityTickers.length
        const progress = `${index}/${securities.length}`

        try {
          await transaction(Model.knex(), async (trx) => {
            await new HistoricalPriceService({ ...this.ctx, trx }).syncEndOfDay(
              securityTickers
            )
          })
          logger.info(
            'job > historicalPricesEndOfDay > successfully synced securities',
            { progress }
          )
        } catch (err) {
          logger.error(
            'job > historicalPricesEndOfDay > failed to sync securities',
            { err, progress }
          )
        }
      },
      { concurrency: 1 }
    )
  }
}

export { JobHistoricalPricesEndOfDayMethod }
