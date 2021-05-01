import { Context } from 'koa'

const apiToken = () => async (ctx: Context, next: Function) => {
  const { 'x-api-token': userToken } = ctx.request.headers

  ctx.state['x-api-token'] = userToken

  await next()
}

export { apiToken }
