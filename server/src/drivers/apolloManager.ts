import type { ApolloServer } from '@apollo/server' with {
  'resolution-mode': 'import',
}

import { config } from '@config'
import { knexDriver } from '@knex'
import { logger } from '@logger'
import { DataloaderPlugin } from '@middlewares/graphql/dataloader'
import { TransactionPlugin } from '@middlewares/graphql/transaction'
import { errorHandlerApollo } from '@middlewares/http/errorHandlerApollo'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { DataloaderService } from '@services/dataloader'
import { RequestContext } from '@typings/context'
import { Connectable } from '@typings/manager'

import { app } from '../app'

class ApolloManager implements Connectable {
  public static path = '/graphql'
  public server: ApolloServer<RequestContext>

  connect = async () => {
    const { ApolloServer } = await import('@apollo/server')
    const { ApolloServerPluginCacheControl } =
      await import('@apollo/server/plugin/cacheControl')
    const { ApolloServerPluginLandingPageLocalDefault } =
      await import('@apollo/server/plugin/landingPage/default')
    this.server = new ApolloServer<RequestContext>({
      schema,
      // ServiceManager coordinates HTTP, subscriptions and database shutdown.
      stopOnTerminationSignals: false,
      introspection: true,
      includeStacktraceInErrorResponses: config.get('graphql.debug'),
      formatError: errorHandlerApollo(logger),
      plugins: [
        ApolloServerPluginLandingPageLocalDefault(),
        ApolloServerPluginCacheControl({ calculateHttpHeaders: false }),
        new TransactionPlugin({
          knex: knexDriver.knex,
          transactionTimeoutMs: config.get('database.idleInTransactionTimeout'),
          logger,
        }),
        new DataloaderPlugin({ class: DataloaderService }),
      ],
    })
    await this.server.start()
  }
  disconnect = () => this.server.stop()

  applyMiddleware = async () => {
    const { koaMiddleware } = await import('@as-integrations/koa')
    const middleware = koaMiddleware(this.server, {
      context: async ({ ctx }) => graphqlContext({ ctx }),
    })
    app.koa.use((ctx, next) =>
      ctx.path === ApolloManager.path ? middleware(ctx, next) : next()
    )
  }
}

const apolloManager = new ApolloManager()
export { apolloManager, ApolloManager }
