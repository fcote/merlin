import { Context } from 'koa'

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

  return c
}

export { graphqlContext }
