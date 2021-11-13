import { Arg, Resolver, Root, Subscription, Authorized } from 'type-graphql'

import { News } from '@models/news'
import { SubscriptionChannel, subscription } from '@pubSub'
import { Right } from '@resolvers'

@Resolver()
class NewsSubscriptionResolver {
  @Authorized([Right.authenticated])
  @Subscription({
    subscribe: subscription({
      channel: SubscriptionChannel.newsChanges,
      onSubscribe: SubscriptionChannel.onSubscribe(
        SubscriptionChannel.newsChanges
      ),
      onCancel: SubscriptionChannel.onCancel(SubscriptionChannel.newsChanges),
      filter: async (payload: News, args: { tickers: string[] }) =>
        args.tickers.includes(payload.security!.ticker),
    }),
  })
  newsChanges(
    @Root() payload: News,
    @Arg('tickers', (_) => [String], { nullable: true }) _: string[]
  ): News {
    return payload
  }
}

export { NewsSubscriptionResolver }
