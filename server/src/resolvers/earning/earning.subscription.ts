import { Arg, Resolver, Root, Subscription, Authorized } from 'type-graphql'

import { Earning } from '@models/earning'
import { SubscriptionChannel, subscription } from '@pubSub'
import { Right } from '@resolvers'

@Resolver()
class EarningSubscriptionResolver {
  @Authorized([Right.authenticated])
  @Subscription({
    subscribe: subscription({
      channel: SubscriptionChannel.earningsChanges,
      onSubscribe: SubscriptionChannel.onSubscribe(
        SubscriptionChannel.earningsChanges
      ),
      onCancel: SubscriptionChannel.onCancel(
        SubscriptionChannel.earningsChanges
      ),
      filter: async (payload: Earning, args: { tickers: string[] }) =>
        args.tickers.includes(payload.security.ticker),
    }),
  })
  earningsChanges(
    @Root() payload: Earning,
    @Arg('tickers', (_) => [String], { nullable: true }) _: string[]
  ): Earning {
    return payload
  }
}

export { EarningSubscriptionResolver }
