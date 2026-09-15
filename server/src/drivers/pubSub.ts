import {
  createPubSub,
  filter as filterEvents,
} from '@graphql-yoga/subscription'
import { GraphQLResolveInfo } from 'graphql'
import { setMaxListeners } from 'node:events'

import { config } from '@config'
import { JobService } from '@services/job'
import { RequestContext } from '@typings/context'

type ArgsDictionary = Record<string, any>

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
    async (context: RequestContext, args: { tickers?: string[] }) => {
      const subscriptionStorage = subscriptionStorages[channel]
      if (!subscriptionStorage[context.user!.id]) return
      subscriptionStorage[context.user!.id] = subscriptionStorage[
        context.user!.id
      ].filter((ticker) => !args.tickers?.includes(ticker))
    }

  export const onSubscribe =
    (channel: SubscriptionChannel) =>
    async (context: RequestContext, args: { tickers?: string[] }) => {
      const subscriptionStorage = subscriptionStorages[channel]
      if (!subscriptionStorage[context.user!.id]) {
        subscriptionStorage[context.user!.id] = []
      }
      subscriptionStorage[context.user!.id].push(...(args.tickers ?? []))
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
  asyncIterator: AsyncIterableIterator<T | undefined>,
  onCancel: () => void | Promise<void>
): AsyncIterableIterator<T | undefined> => {
  if (!asyncIterator.return) {
    asyncIterator.return = () =>
      Promise.resolve({ value: undefined, done: true })
  }

  const savedReturn = asyncIterator.return.bind(asyncIterator)
  asyncIterator.return = async () => {
    try {
      return await savedReturn()
    } finally {
      await onCancel()
    }
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
  async ({
    args,
    context,
  }: {
    args: ArgsDictionary
    context: RequestContext
    info: GraphQLResolveInfo
  }) => {
    await onSubscribe?.(context, args)

    const asyncIterator = filterEvents<any>((payload) =>
      filter ? filter(payload, args as AT) : true
    )(pubSub.subscribe(channel))

    return withCancel(asyncIterator, () => onCancel?.(context, args))
  }

const eventTarget = new EventTarget()
setMaxListeners(config.get('pubsub.maxListeners'), eventTarget)
const pubSub = createPubSub<Record<SubscriptionChannel, [any]>>({ eventTarget })

export {
  pubSub,
  subscriptionStorages,
  subscriptionJobs,
  subscription,
  withCancel,
  SubscriptionChannel,
  SubscriptionOptions,
}
