import { Security } from '@models/security'
import { SubscriptionChannel, subscription } from '@pubSub'

class SecuritySyncProgressChange {
  ticker: string

  progress: number
}

class SecuritySubscriptionResolver {
  securityPriceChanges(payload: Security, _: string[]): Security {
    return payload
  }

  securitySyncProgressChanges(
    payload: SecuritySyncProgressChange,
    _: string
  ): SecuritySyncProgressChange {
    return payload
  }
}

export { SecuritySubscriptionResolver, SecuritySyncProgressChange }

export const securityPriceChangesSubscribe = subscription({
  channel: SubscriptionChannel.securityPricesChanges,
  onSubscribe: SubscriptionChannel.onSubscribe(
    SubscriptionChannel.securityPricesChanges
  ),
  onCancel: SubscriptionChannel.onCancel(
    SubscriptionChannel.securityPricesChanges
  ),
  filter: async (payload: Security, args: { tickers: string[] }) =>
    args.tickers.includes(payload.ticker),
})
export const securitySyncProgressChangesSubscribe = subscription({
  channel: SubscriptionChannel.securitySyncProgressChanges,
  filter: async (
    payload: SecuritySyncProgressChange,
    args: { ticker: string }
  ) => args.ticker === payload.ticker,
})
