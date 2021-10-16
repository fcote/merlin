import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageGraphQLPlaygroundOptions,
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-koa'

import { config } from '@config'
import { knexDriver } from '@knex'
import { logger } from '@logger'
import {
  DataloaderPlugin,
  DataloaderPluginConfig,
} from '@middlewares/graphql/dataloader'
import {
  TransactionPlugin,
  TransactionPluginConfig,
} from '@middlewares/graphql/transaction'
import { errorHandlerApollo } from '@middlewares/http/errorHandlerApollo'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { DataloaderService } from '@services/dataloader'
import { Connectable } from '@typings/manager'

import { app } from '../app'

class ApolloManager implements Connectable {
  public server: ApolloServer

  private static path: string = '/graphql'
  private static subscriptionPath: string = '/subscriptions'

  private static cacheControlOptions: ApolloServerPluginCacheControlOptions = {
    calculateHttpHeaders: false,
  }
  private static transactionOptions: TransactionPluginConfig = {
    knex: knexDriver.knex,
    transactionTimeoutMs: config.get('database.idleInTransactionTimeout'),
    logger,
  }
  private static dataloaderOptions: DataloaderPluginConfig = {
    class: DataloaderService,
  }
  private static playgroundOptions: ApolloServerPluginLandingPageGraphQLPlaygroundOptions =
    {
      endpoint: `${config.get('endpoint')}${ApolloManager.path}`,
      subscriptionEndpoint: `${config.get('endpoint')}${ApolloManager.path}${
        ApolloManager.subscriptionPath
      }`,
      settings: {
        'editor.cursorShape': 'block',
        'request.credentials': 'same-origin',
        'schema.polling.enable': false,
      },
    }

  constructor() {
    this.server = new ApolloServer({
      schema,
      debug: config.get('graphql.debug'),
      introspection: true,
      context: graphqlContext,
      formatError: errorHandlerApollo(logger),
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(
          ApolloManager.playgroundOptions
        ),
        new TransactionPlugin(ApolloManager.transactionOptions),
        new DataloaderPlugin(ApolloManager.dataloaderOptions),
        ApolloServerPluginCacheControl(ApolloManager.cacheControlOptions),
        require('apollo-tracing').plugin(),
      ],
    })
  }

  connect = async (): Promise<void> => {
    await this.server.start()
  }

  disconnect = async (): Promise<void> => {
    await this.server.stop()
  }

  applyMiddleware = () => {
    this.server.applyMiddleware({
      app: app.koa,
      path: ApolloManager.path,
      cors: false,
      bodyParserConfig: true,
    })
  }
}

const apolloManager = new ApolloManager()

export { apolloManager, ApolloManager }
