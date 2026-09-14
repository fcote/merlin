import cors from '@koa/cors'
import { useServer } from 'graphql-ws/use/ws'
import { Server, createServer } from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { WebSocketServer } from 'ws'

import { config } from '@config'
import { apolloManager } from '@drivers/apolloManager'
import { logger } from '@logger'
import { apiToken } from '@middlewares/http/apiToken'
import { errorHandler } from '@middlewares/http/errorHandler'
import { validateOrigin } from '@middlewares/http/validateOrigins'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { UserService } from '@services/user'
import { ApolloForbidden } from '@typings/errors/apolloErrors'
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

  private subscriptionServer: { dispose: () => void | Promise<void> }

  public connect = async (): Promise<void> => {
    await apolloManager.connect()

    return new Promise(async (resolve, _) => {
      const port = config.get('port')

      await this.applyMiddlewares()

      this.server = createServer(this.koa.callback())
      this.server.keepAliveTimeout = config.get('keepAliveTimeout')

      this.subscriptionServer = useServer(
        {
          schema,
          context: async (ctx) => {
            const context = graphqlContext({
              connectionParams: ctx.connectionParams ?? {},
            })
            if (!context.userToken) throw new ApolloForbidden('ACCESS_DENIED')
            const user = await new UserService(context).findOne({
              apiToken: context.userToken,
            })
            if (!context.userToken || !user)
              throw new ApolloForbidden('ACCESS_DENIED')
            context.user = user
            return context
          },
        },
        new WebSocketServer({
          server: this.server,
          path: `/graphql${this.subscriptionPath}`,
        })
      )

      this.server.listen(port, () => {
        resolve()
        logger.info(`Server listening on port: ${port}`)
      })
    })
  }

  public disconnect = async (): Promise<void> => {
    await this.subscriptionServer?.dispose()
    await apolloManager.disconnect()

    if (!this.server || !this.server.address()) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  private applyMiddlewares = async () => {
    this.koa
      .use(cors(this.corsOptions))
      .use(bodyParser())
      .use(errorHandler())
      .use(apiToken())

    await apolloManager.applyMiddleware()
  }
}

const app = new App()

export { App, app }
