import cors from '@koa/cors'
import { execute, subscribe } from 'graphql'
import { Server, createServer } from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { config } from '@config'
import { apolloManager } from '@drivers/apolloManager'
import { knexDriver } from '@knex'
import { logger } from '@logger'
import { apiToken } from '@middlewares/apiToken'
import { errorHandler } from '@middlewares/errorHandler'
import { transactional } from '@middlewares/transactional'
import { validateOrigin } from '@middlewares/validateOrigins'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { Connectable } from '@typings/manager'

class App implements Connectable {
  private static validOrigins: RegExp[] = [new RegExp('http://localhost:.*')]

  private corsOptions: cors.Options = {
    origin: validateOrigin(App.validOrigins) as unknown as string,
    credentials: true,
  }
  private subscriptionPath: string = '/subscriptions'

  public server: Server
  public koa: Koa = new Koa()

  private subscriptionServer: SubscriptionServer

  public connect = async (): Promise<void> => {
    await apolloManager.connect()

    return new Promise(async (resolve, _) => {
      const port = config.get('port')

      this.applyMiddlewares()

      this.server = createServer(this.koa.callback())
      this.server.keepAliveTimeout = config.get('keepAliveTimeout')

      this.subscriptionServer = SubscriptionServer.create(
        {
          schema,
          execute,
          subscribe,
          onConnect: (connectionParams) => graphqlContext({ connectionParams }),
        },
        {
          server: this.server,
          path: `${apolloManager.server.graphqlPath}${this.subscriptionPath}`,
        }
      )

      this.server.listen(port, () => {
        resolve()
        logger.info(`Server listening on port: ${port}`)
      })
    })
  }

  public disconnect = async (): Promise<void> => {
    await apolloManager.disconnect()

    if (!this.server || !this.server.address()) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.subscriptionServer.close()

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

    apolloManager.applyMiddleware()
  }
}

const app = new App()

export { App, app }
