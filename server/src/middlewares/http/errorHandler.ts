import { Context } from 'koa'

import { logger } from '@logger'
import { APIError, InternalServerError } from '@typings/errors/errors'

const errorHandler = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const error = handleError()(err, ctx)

    ctx.type = 'application/json'
    ctx.status = error.status
    ctx.body = {
      status: error.status,
      error: error.code,
      message: error.message,
    }
  }
}

const handleError = () => (error: any, ctx?: Context) => {
  if (!(error instanceof APIError)) {
    const stack = error.stack
    error = new InternalServerError(error.message)
    error.stack = stack
  }

  const properties = error.properties || error.extensions
  const code = error.code || error.extensions.code

  const err = error as APIError
  const level = getLevel(err.status, err.message)

  if (level) {
    logger[level](err.message, {
      err,
      body: ctx?.request?.body,
      errorCode: code ?? err.message,
      errorMessage: err.message,
      errorProperties: properties,
      errorStatus: err.status,
    })
  }

  err.properties = properties
  err.code = code

  return err
}

const getLevel = (status: number, message: string) => {
  let level = 'error'
  if (status >= 400 && status < 500) level = 'warn'
  if ([401, 403, 404, 409, 423, 498, 304, 413, 422].includes(status))
    level = 'info'
  if (message === 'PersistedQueryNotFound') level = null

  return level
}

export { errorHandler, handleError, getLevel }
