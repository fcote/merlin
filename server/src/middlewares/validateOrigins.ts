import { Context } from 'koa'
import { isRegExp } from 'lodash'

type Origin = string | RegExp

const isValidOrigin = (validOrigins: Origin[], origin: string) => {
  return validOrigins.some((allowedOrigin) => {
    return isRegExp(allowedOrigin)
      ? allowedOrigin.test(origin)
      : allowedOrigin === origin
  })
}

const validateOrigin = (validOrigins: Origin[]) => (ctx: Context) => {
  const origin = ctx.headers.origin
  if (!isValidOrigin(validOrigins, origin)) return false
  return origin
}

export { validateOrigin }
