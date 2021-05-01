import { omit, sortBy, uniq } from 'lodash'
import { PartialModelGraph } from 'objection'
import pmap from 'p-map'

import { newsLink } from '@links/links'
import { SecurityNewsResult } from '@links/types'
import { News } from '@models/news'
import { Security } from '@models/security'
import { pubSub, SubscriptionChannel } from '@pubSub'
import { ServiceMethod } from '@services/service'

class JobNewsMethod extends ServiceMethod {
  run = async (): Promise<void> => {
    // Retrieve the update news list
    const newsList = await newsLink.news()

    // Retrieve existing securities & the latest existing news
    const securities = await Security.query(this.trx).whereIn(
      'ticker',
      newsList.map((n) => n.ticker)
    )
    const currentNews = await News.query(this.trx)
      .select('news.*')
      .joinRelated('security')
      .whereIn('news.type', uniq(newsList.map((n) => n.type)))
      .whereIn('news.title', uniq(newsList.map((n) => n.title)))
      .whereIn('security.ticker', uniq(newsList.map((n) => n.ticker)))
      .withGraphFetched('security')

    const filterNews = (n: SecurityNewsResult) =>
      !currentNews.find(
        (current) =>
          current.security.ticker === n.ticker &&
          current.title === n.title &&
          current.type === n.type
      )
    const mapNewsInput = (n: SecurityNewsResult) => ({
      ...omit(n, 'ticker'),
      securityId: securities.find((s) => s.ticker === n.ticker)?.id,
    })

    // Compute the news inputs and filter out the already existing ones
    const newsInputs: PartialModelGraph<News>[] = newsList
      .filter(filterNews)
      .map(mapNewsInput)
      .filter((n) => n.securityId)

    // Insert the latest news
    const latestNews = await News.query(this.trx)
      .upsertGraph(newsInputs, { relate: true })
      .withGraphFetched('security')

    // Notify
    await pmap(
      sortBy(latestNews, (n) => n.date),
      async (news) => {
        return pubSub.publish(SubscriptionChannel.newsChanges, news)
      },
      { concurrency: 1 }
    )
  }
}

export { JobNewsMethod }
