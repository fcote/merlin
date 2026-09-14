import { News } from '@models/news'
import { SubscriptionChannel, subscription } from '@pubSub'

class NewsSubscriptionResolver {
  newsChanges(payload: News, _: string[]): News {
    return payload
  }
}

export { NewsSubscriptionResolver }

export const newsChangesSubscribe = subscription({
  channel: SubscriptionChannel.newsChanges,
  onSubscribe: SubscriptionChannel.onSubscribe(SubscriptionChannel.newsChanges),
  onCancel: SubscriptionChannel.onCancel(SubscriptionChannel.newsChanges),
  filter: async (payload: News, args: { tickers: string[] }) =>
    args.tickers.includes(payload.security!.ticker),
})
