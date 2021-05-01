import { Context } from 'koa'
import { ExecutionParams } from 'subscriptions-transport-ws'

import { DataloaderService } from '@services/dataloader'
import { RequestContext } from '@typings/context'

const graphqlContext = ({
  ctx,
  connection,
}: {
  ctx: Context
  connection: ExecutionParams
}): RequestContext => {
  const state = ctx?.state ?? connection?.context

  const c: RequestContext = {}
  c.user = state.user
  c.userToken = state['x-api-token']
  c.trx = state.trx
  c.loaders = new DataloaderService(c)

  return c
}

export { graphqlContext }
