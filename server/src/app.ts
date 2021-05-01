import cors from '@koa/cors'
import { ApolloServer } from 'apollo-server-koa'
import { Server, createServer } from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import { config } from '@config'
import { knexDriver } from '@knex'
import { logger } from '@logger'
import { apiToken } from '@middlewares/apiToken'
import { errorHandler } from '@middlewares/errorHandler'
import { errorHandlerApollo } from '@middlewares/errorHandlerApollo'
import { transactional } from '@middlewares/transactional'
import { validateOrigin } from '@middlewares/validateOrigins'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { Connectable } from '@typings/manager'

class App implements Connectable {
  private static validOrigins: RegExp[] = [new RegExp('http://localhost:.*')]

  private corsOptions: cors.Options = {
    origin: (validateOrigin(App.validOrigins) as unknown) as string,
    credentials: true,
  }
  private path: string = '/graphql'
  private subscriptionPath: string = '/subscriptions'

  public server: Server
  private apollo: ApolloServer
  private koa: Koa = new Koa()

  constructor() {
    this.apollo = new ApolloServer({
      schema,
      tracing: config.get('graphql.tracing'),
      debug: config.get('graphql.debug'),
      context: graphqlContext,
      introspection: true,
      formatError: errorHandlerApollo(logger),
      playground: {
        settings: {
          'editor.cursorShape': 'block',
          'request.credentials': 'same-origin',
        },
        endpoint: `${config.get('endpoint')}${this.path}`,
        subscriptionEndpoint: `${config.get('endpoint')}${this.path}${
          this.subscriptionPath
        }`,
      },
      subscriptions: {
        path: `${this.path}${this.subscriptionPath}`,
      },
    })

    this.applyMiddlewares()
  }

  public connect = (): Promise<void> => {
    return new Promise((resolve, _) => {
      const port = config.get('port')

      this.server = createServer(this.koa.callback())
      this.apollo.installSubscriptionHandlers(this.server)
      this.server.keepAliveTimeout = config.get('keepAliveTimeout')
      this.server.listen(port, () => {
        resolve()
        logger.info(`Server listening on port: ${port}`)
      })
    })
  }

  public disconnect = (): Promise<void> => {
    if (!this.server || !this.server.address()) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  private applyMiddlewares = () => {
    this.koa
      .use(cors(this.corsOptions))
      .use(bodyParser())
      .use(errorHandler())
      .use(apiToken())
      .use(transactional(knexDriver.knex))

    this.apollo.applyMiddleware({
      app: this.koa,
      path: this.path,
      cors: false,
      bodyParserConfig: true,
    })
  }
}

const app = new App()

export { App, app }
