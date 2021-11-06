import { uniq } from 'lodash'
import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { logger } from '@logger'
import { pubSub, SubscriptionChannel, subscriptionStorages } from '@pubSub'
import { EarningService } from '@services/earning'
import { ServiceMethod } from '@services/service'

class JobEarningSubscribedMethod extends ServiceMethod {
  run = async (): Promise<void> => {
    const tickers = uniq(
      Object.values(
        subscriptionStorages[SubscriptionChannel.earningsChanges]
      ).flat()
    )

    await pmap(
      tickers,
      async (ticker) => {
        try {
          const earnings = await transaction(Model.knex(), async (trx) => {
            return new EarningService({ trx }).sync(ticker)
          })
          await pmap(earnings, async (n) => {
            await pubSub.publish(SubscriptionChannel.earningsChanges, n)
          })
        } catch (err) {
          logger.error('job > earningSubscribed > failed to sync earning', {
            err,
            ticker,
          })
        }
      },
      { concurrency: 1 }
    )
  }
}

export { JobEarningSubscribedMethod }
