import { Context } from 'koa'

import { DataloaderService } from '@services/dataloader'
import { RequestContext } from '@typings/context'

const graphqlContext = ({
  ctx,
  connectionParams,
}: {
  ctx?: Context
  connectionParams?: any
}): RequestContext => {
  const state = ctx?.state ?? connectionParams

  const c: RequestContext = {}
  c.user = state.user
  c.userToken = state['x-api-token']
  c.trx = state.trx
  c.loaders = new DataloaderService(c)

  return c
}

export { graphqlContext }
