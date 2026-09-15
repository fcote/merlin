import { Earning } from '@models/earning'
import { SubscriptionChannel, subscription } from '@pubSub'

class EarningSubscriptionResolver {
  earningsChanges(payload: Earning, _: string[]): Earning {
    return payload
  }
}

export { EarningSubscriptionResolver }

export const earningsChangesSubscribe = subscription({
  channel: SubscriptionChannel.earningsChanges,
  onSubscribe: SubscriptionChannel.onSubscribe(
    SubscriptionChannel.earningsChanges
  ),
  onCancel: SubscriptionChannel.onCancel(SubscriptionChannel.earningsChanges),
  filter: async (payload: Earning, args: { tickers: string[] }) =>
    args.tickers.includes(payload.security.ticker),
})
