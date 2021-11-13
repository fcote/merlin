import {
  Arg,
  Resolver,
  Root,
  Subscription,
  ObjectType,
  Field,
  Float,
  Authorized,
} from 'type-graphql'

import { Security } from '@models/security'
import { SubscriptionChannel, subscription } from '@pubSub'
import { Right } from '@resolvers'

@ObjectType('SecuritySyncProgressChange')
class SecuritySyncProgressChange {
  @Field((_) => String)
  ticker: string
  @Field((_) => Float, { nullable: true })
  progress: number
}

@Resolver()
class SecuritySubscriptionResolver {
  @Authorized([Right.authenticated])
  @Subscription({
    subscribe: subscription({
      channel: SubscriptionChannel.securityPricesChanges,
      onSubscribe: SubscriptionChannel.onSubscribe(
        SubscriptionChannel.securityPricesChanges
      ),
      onCancel: SubscriptionChannel.onCancel(
        SubscriptionChannel.securityPricesChanges
      ),
      filter: async (payload: Security, args: { tickers: string[] }) =>
        args.tickers.includes(payload.ticker),
    }),
  })
  securityPriceChanges(
    @Root() payload: Security,
    @Arg('tickers', (_) => [String], { nullable: true }) _: string[]
  ) {
    return payload
  }

  @Authorized([Right.authenticated])
  @Subscription({
    subscribe: subscription({
      channel: SubscriptionChannel.securitySyncProgressChanges,
      filter: async (
        payload: SecuritySyncProgressChange,
        args: { ticker: string }
      ) => args.ticker === payload.ticker,
    }),
  })
  securitySyncProgressChanges(
    @Root() payload: SecuritySyncProgressChange,
    @Arg('ticker', (_) => String, { nullable: true }) _: string
  ) {
    return payload
  }
}

export { SecuritySubscriptionResolver, SecuritySyncProgressChange }
