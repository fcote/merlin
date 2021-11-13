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
  const isSubscription = !!connectionParams
  const state = ctx?.state ?? connectionParams

  const c: RequestContext = {
    user: state.user,
    userToken: state['x-api-token'],
  }

  if (isSubscription) {
    c.loaders = new DataloaderService(c)
  }

  return c
}

export { graphqlContext }
