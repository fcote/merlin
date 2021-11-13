import { chunk, uniq } from 'lodash'
import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { logger } from '@logger'
import { pubSub, SubscriptionChannel, subscriptionStorages } from '@pubSub'
import { SecurityService } from '@services/security'
import { ServiceMethod } from '@services/service'

class JobPricesSubscribedMethod extends ServiceMethod {
  private batchSize: number = 50

  run = async (): Promise<void> => {
    const tickers = uniq(
      Object.values(
        subscriptionStorages[SubscriptionChannel.securityPricesChanges]
      ).flat()
    )
    const tickerChunks = chunk(tickers, this.batchSize)

    await pmap(
      tickerChunks,
      async (tickerChunk) => {
        try {
          const securities = await transaction(Model.knex(), async (trx) => {
            return new SecurityService({ ...this.ctx, trx }).syncPrices(
              tickerChunk
            )
          })
          await pmap(securities, async (security) => {
            await pubSub.publish(
              SubscriptionChannel.securityPricesChanges,
              security
            )
          })
        } catch (err) {
          logger.error(
            'job > pricesSubscribed > failed to sync security prices',
            { err }
          )
        }
      },
      { concurrency: 1 }
    )
  }
}

export { JobPricesSubscribedMethod }
