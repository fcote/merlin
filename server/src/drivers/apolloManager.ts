import {
  PluginDefinition,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageGraphQLPlaygroundOptions,
  ApolloServerPluginCacheControl,
} from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-koa'

import { config } from '@config'
import { logger } from '@logger'
import { errorHandlerApollo } from '@middlewares/errorHandlerApollo'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { Connectable } from '@typings/manager'

import { app } from '../app'

class ApolloManager implements Connectable {
  public server: ApolloServer

  private static path: string = '/graphql'
  private static subscriptionPath: string = '/subscriptions'

  constructor() {
    this.server = new ApolloServer({
      schema,
      debug: config.get('graphql.debug'),
      introspection: true,
      context: graphqlContext,
      formatError: errorHandlerApollo(logger),
      plugins: this.getApolloPluginDefinitions(),
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

  private getApolloPluginDefinitions = (): PluginDefinition[] => {
    const plugins: PluginDefinition[] = []

    const defaultPlaygroundConfig = {
      settings: {
        'editor.cursorShape': 'block',
        'request.credentials': 'same-origin',
        'schema.polling.enable': false,
        endpoint: `${config.get('endpoint')}${ApolloManager.path}`,
        subscriptionEndpoint: `${config.get('endpoint')}${ApolloManager.path}${
          ApolloManager.subscriptionPath
        }`,
      },
    } as ApolloServerPluginLandingPageGraphQLPlaygroundOptions
    plugins.push(
      ApolloServerPluginLandingPageGraphQLPlayground({
        ...defaultPlaygroundConfig,
      })
    )

    plugins.push(
      ApolloServerPluginCacheControl({
        calculateHttpHeaders: false,
      })
    )

    plugins.push(require('apollo-tracing').plugin())

    return plugins
  }
}

const apolloManager = new ApolloManager()

export { apolloManager, ApolloManager }
