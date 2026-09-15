import { useAPQ } from '@graphql-yoga/plugin-apq'
import { createYoga } from 'graphql-yoga'
import type { Context } from 'koa'

import { config } from '@config'
import { usePreflightProtection } from '@middlewares/graphql/csrf'
import { useOperationTransaction } from '@middlewares/graphql/transaction'
import { schema } from '@resolvers'
import { graphqlContext } from '@resolvers/context'
import { RequestContext } from '@typings/context'

const yoga = createYoga<{ koaContext: Context }, RequestContext>({
  schema,
  graphqlEndpoint: '/graphql',
  cors: false, // Koa owns the existing origin policy.
  graphiql: config.get('graphql.debug'),
  maskedErrors: false, // Keep Merlin's existing typed GraphQL error codes.
  context: ({ koaContext }) => graphqlContext({ ctx: koaContext }),
  plugins: [
    usePreflightProtection(),
    useAPQ({ responseConfig: { forceStatusCodeOk: true } }),
    useOperationTransaction(),
  ],
})

export const graphqlMiddleware = async (ctx: Context) => {
  const response = await yoga.handleNodeRequestAndResponse(
    ctx.request,
    ctx.res,
    { koaContext: ctx }
  )
  ctx.status = response.status
  response.headers.forEach((value, key) => ctx.set(key, value))
  ctx.body = response.body
}

export const disposeGraphQL = () => yoga.dispose()
