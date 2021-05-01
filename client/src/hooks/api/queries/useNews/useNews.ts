import { SubscribeToMoreOptions } from '@apollo/client/core/watchQueryOptions'
import { mergeDeep } from '@apollo/client/utilities'
import { sortBy } from 'lodash'

import useNewsQuery from '@hooks/api/queries/useNews/useNews.query'
import useNewsChangesSubscription from '@hooks/api/subscriptions/useNewsChanges/useNewsChanges.subscription'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { News } from '@lib/news'

export type NewsFilters = {
  ticker: string
}

const useNews = () => {
  const [getNews, { data, ...rest }] = useLazyPaginatedQuery<
    News,
    { filters: NewsFilters }
  >(useNewsQuery)

  return { ...rest, getNews, news: data }
}

const subscribeToMoreNews = (ticker: string): SubscribeToMoreOptions => ({
  document: useNewsChangesSubscription,
  variables: { tickers: [ticker] },
  updateQuery: (prev, { subscriptionData }) => {
    if (!subscriptionData.data) return prev
    const newNodes = [subscriptionData.data.newsChanges, ...prev.news.nodes]
    return mergeDeep({}, prev, {
      news: {
        nodes: sortBy(newNodes, (n) => n.date).reverse(),
      },
    })
  },
})

export { useNews, subscribeToMoreNews }
