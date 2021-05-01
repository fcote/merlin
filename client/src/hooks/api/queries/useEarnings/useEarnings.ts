import { SubscribeToMoreOptions } from '@apollo/client/core/watchQueryOptions'
import { mergeDeep } from '@apollo/client/utilities'
import { sortBy } from 'lodash'

import useEarningsQuery from '@hooks/api/queries/useEarnings/useEarnings.query'
import useEarningsChangesSubscription from '@hooks/api/subscriptions/useEarningsChanges/useEarningsChanges.subscription'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { Earning } from '@lib/earning'

export type EarningFilters = {
  ticker: string
}

const useEarnings = () => {
  const [getEarnings, { data, ...rest }] = useLazyPaginatedQuery<
    Earning,
    { filters: EarningFilters }
  >(useEarningsQuery)

  return { ...rest, getEarnings, earnings: data }
}

const subscribeToMoreEarnings = (ticker: string): SubscribeToMoreOptions => ({
  document: useEarningsChangesSubscription,
  variables: { tickers: [ticker] },
  updateQuery: (prev, { subscriptionData }) => {
    if (!subscriptionData.data) return prev
    const newNodes = [
      subscriptionData.data.earningsChanges,
      ...prev.earnings.nodes.filter(
        (n) => n.date !== subscriptionData.data.earningsChanges.date
      ),
    ]
    return mergeDeep({}, prev, {
      earnings: {
        nodes: sortBy(newNodes, (n) => n.date).reverse(),
      },
    })
  },
})

export { useEarnings, subscribeToMoreEarnings }
