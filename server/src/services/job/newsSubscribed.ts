import { uniq } from 'lodash'
import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { logger } from '@logger'
import { pubSub, SubscriptionChannel, subscriptionStorages } from '@pubSub'
import { NewsService } from '@services/news'
import { ServiceMethod } from '@services/service'

class JobNewsSubscribedMethod extends ServiceMethod {
  run = async (): Promise<void> => {
    const tickers = uniq(
      Object.values(
        subscriptionStorages[SubscriptionChannel.newsChanges]
      ).flat()
    )

    await pmap(
      tickers,
      async (ticker) => {
        try {
          const news = await transaction(Model.knex(), async (trx) => {
            return new NewsService({ ...this.ctx, trx }).sync(ticker)
          })
          if (!news) return
          await pmap(news, async (n) => {
            await pubSub.publish(SubscriptionChannel.newsChanges, n)
          })
        } catch (err) {
          logger.error('job > newsSubscribed > failed to sync news', {
            err,
            ticker,
          })
        }
      },
      { concurrency: 1 }
    )
  }
}

export { JobNewsSubscribedMethod }
