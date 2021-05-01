import { SubscribeToMoreOptions } from '@apollo/client/core/watchQueryOptions'
import { mergeDeep } from '@apollo/client/utilities'
import { uniq } from 'lodash'

import useSelfUserAccountSecuritiesQuery from '@hooks/api/queries/useSelfUserAccountSecurities/useSelfUserAccountSecurities.query'
import useSecurityPriceChangesSubscription from '@hooks/api/subscriptions/useSecurityPriceChanges/useSecurityPriceChanges.subscription'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import UserAccountSecurity from '@lib/userAccountSecurity'

const useSelfUserAccountSecurities = () =>
  usePaginatedQuery<UserAccountSecurity>(useSelfUserAccountSecuritiesQuery, {
    namespace: 'self',
  })

const subscribeToMoreUserAccountSecurityPrices = (
  tickers: string[]
): SubscribeToMoreOptions => ({
  document: useSecurityPriceChangesSubscription,
  variables: { tickers: uniq(tickers) },
  updateQuery: (prev, { subscriptionData }) => {
    const newData = subscriptionData?.data?.securityPriceChanges
    if (!newData) return prev
    const newNodes: UserAccountSecurity[] = prev.self.userAccountSecurities.nodes.map(
      (node) => {
        if (node.security.ticker !== newData.ticker) return { ...node }
        const securityData = { ...node.security, ...newData }
        return { ...node, security: securityData }
      }
    )
    return mergeDeep({}, prev, {
      self: {
        userAccountSecurities: {
          nodes: newNodes,
        },
      },
    })
  },
})

export {
  useSelfUserAccountSecurities,
  subscribeToMoreUserAccountSecurityPrices,
}
