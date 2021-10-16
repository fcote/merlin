import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  BaseContext as ApolloBaseContext,
} from 'apollo-server-plugin-base'

class DefaultDataloader {
  ctx: BaseContext
  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }
}

type BaseContext<L extends DefaultDataloader = DefaultDataloader> =
  ApolloBaseContext & { loaders?: L }

type DataloaderPluginConfig<
  L extends typeof DefaultDataloader = typeof DefaultDataloader
> = {
  class?: L
}

class DataloaderPlugin<
  C extends BaseContext = BaseContext,
  L extends typeof DefaultDataloader = typeof DefaultDataloader
> implements ApolloServerPlugin<C>
{
  constructor(private config: DataloaderPluginConfig<L>) {}

  async requestDidStart(): Promise<GraphQLRequestListener<C>> {
    return {
      didResolveOperation: async ({ context }) => {
        if (context.trxStartPromise) {
          // Wait for the sql transaction to be started before instantiating the dataloader
          await context.trxStartPromise
        }
        context.loaders = new this.config.class(context)
      },
    }
  }
}

export { DataloaderPlugin, DataloaderPluginConfig }
