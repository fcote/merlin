import EventEmitter from 'events'
import { GraphQLResolveInfo } from 'graphql'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { ArgsDictionary } from 'type-graphql'

import { config } from '@config'
import { JobService } from '@services/job'
import { RequestContext } from '@typings/context'

// Subscription channels

enum SubscriptionChannel {
  securityPricesChanges = 'security.prices',
  securitySyncProgressChanges = 'security.syncProgress',
  newsChanges = 'news',
  earningsChanges = 'earningsChanges',
}

const subscriptionStorages: Record<
  SubscriptionChannel,
  Record<number | string, string[]>
> = {
  [SubscriptionChannel.securitySyncProgressChanges]: {},
  [SubscriptionChannel.securityPricesChanges]: {},
  [SubscriptionChannel.newsChanges]: {},
  [SubscriptionChannel.earningsChanges]: {},
}

const subscriptionJobs: Record<
  SubscriptionChannel,
  (context: RequestContext) => Promise<boolean>
> = {
  [SubscriptionChannel.securitySyncProgressChanges]: async () => true,
  [SubscriptionChannel.securityPricesChanges]: (context) =>
    new JobService(context).pricesSubscribed(),
  [SubscriptionChannel.newsChanges]: (context) =>
    new JobService(context).newsSubscribed(),
  [SubscriptionChannel.earningsChanges]: (context) =>
    new JobService(context).earningsSubscribed(),
}

// eslint-disable-next-line no-redeclare
namespace SubscriptionChannel {
  export const onCancel =
    (channel: SubscriptionChannel) =>
    async (context: RequestContext, args: { tickers: string[] }) => {
      const subscriptionStorage = subscriptionStorages[channel]
      if (!subscriptionStorage[context.user.id]) return
      subscriptionStorage[context.user.id] = subscriptionStorage[
        context.user.id
      ].filter((ticker) => !args.tickers.includes(ticker))
    }

  export const onSubscribe =
    (channel: SubscriptionChannel) =>
    async (context: RequestContext, args: { tickers: string[] }) => {
      const subscriptionStorage = subscriptionStorages[channel]
      if (!subscriptionStorage[context.user.id]) {
        subscriptionStorage[context.user.id] = []
      }
      subscriptionStorage[context.user.id].push(...args.tickers)
      subscriptionJobs[channel](context).then()
    }
}

// Subscription helpers

type SubscriptionOptions<PT, AT> = {
  channel: SubscriptionChannel
  onSubscribe?: (context: RequestContext, args: ArgsDictionary) => Promise<void>
  onCancel?: (context: RequestContext, args: ArgsDictionary) => Promise<void>
  filter?: (payload: PT, args: AT) => Promise<boolean>
}

const withCancel = <T>(
  asyncIterator: AsyncIterator<T | undefined>,
  onCancel: () => void
): AsyncIterator<T | undefined> => {
  if (!asyncIterator.return) {
    asyncIterator.return = () =>
      Promise.resolve({ value: undefined, done: true })
  }

  const savedReturn = asyncIterator.return.bind(asyncIterator)
  asyncIterator.return = () => {
    onCancel()
    return savedReturn()
  }

  return asyncIterator
}

const subscription =
  <PT, AT>({
    channel,
    onSubscribe,
    onCancel,
    filter,
  }: SubscriptionOptions<PT, AT>) =>
  (
    root: any,
    args: ArgsDictionary,
    context: RequestContext,
    info: GraphQLResolveInfo
  ) => {
    onSubscribe?.(context, args)

    const asyncIterator = withFilter(
      () => pubSub.asyncIterator(channel),
      (payload, variables) => (filter ? filter(payload, variables) : true)
    )(root, args, context, info)

    return withCancel(asyncIterator, () => {
      onCancel?.(context, args)
    })
  }

const eventEmitter = new EventEmitter()
eventEmitter.setMaxListeners(config.get('pubsub.maxListeners'))
const pubSub = new PubSub({ eventEmitter })

export {
  pubSub,
  subscriptionStorages,
  subscriptionJobs,
  subscription,
  withCancel,
  SubscriptionChannel,
  SubscriptionOptions,
}
