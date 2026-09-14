import { SubscribeToMoreOptions } from '@apollo/client'
import { merge as mergeDeep } from 'lodash'
import { uniq } from 'lodash'

import useSelfFollowedSecurityGroupsQuery from '@hooks/api/queries/useSelfFollowedSecurityGroups/useSelfFollowedSecurityGroups.query'
import useSecurityPriceChangesSubscription from '@hooks/api/subscriptions/useSecurityPriceChanges/useSecurityPriceChanges.subscription'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import FollowedSecurity from '@lib/followedSecurity'
import FollowedSecurityGroup, {
  FollowedSecurityGroupType,
} from '@lib/followedSecurityGroup'

const useSelfFollowedSecurityGroups = (type: FollowedSecurityGroupType) =>
  usePaginatedQuery<FollowedSecurityGroup>(useSelfFollowedSecurityGroupsQuery, {
    variables: {
      filters: { type },
    },
    namespace: 'self',
  })

const subscribeToMoreFollowedSecurityGroupPrices = (
  tickers: string[]
): SubscribeToMoreOptions<any> => ({
  document: useSecurityPriceChangesSubscription,
  variables: { tickers: uniq(tickers) },
  updateQuery: (prev, { subscriptionData }) => {
    const newData = subscriptionData?.data?.securityPriceChanges
    if (!newData) return prev
    const newNodes: FollowedSecurityGroup[] =
      prev.self.followedSecurityGroups.nodes.map((node) => {
        const newFollowedSecurities: FollowedSecurity[] =
          node.followedSecurities.nodes.map((fsNode) => {
            if (fsNode.security.ticker !== newData.ticker) return { ...fsNode }
            const securityData = { ...fsNode.security, ...newData }
            return { ...fsNode, security: securityData }
          })
        return mergeDeep({}, node, {
          followedSecurities: { nodes: newFollowedSecurities },
        })
      })
    return mergeDeep({}, prev, {
      self: {
        followedSecurityGroups: {
          nodes: newNodes,
        },
      },
    })
  },
})

export {
  useSelfFollowedSecurityGroups,
  subscribeToMoreFollowedSecurityGroupPrices,
}
