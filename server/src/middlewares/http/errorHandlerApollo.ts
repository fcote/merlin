import { GraphQLError } from 'graphql'
import { Logger } from 'winston'

import { getLevel } from '@middlewares/http/errorHandler'
import { ApolloBadRequest } from '@typings/errors/apolloErrors'

const reformatError = (err: GraphQLError) => {
  const validationErrors = ['VariableDefinition']
  const errorKinds = err.nodes ? err.nodes.map((n) => n.kind) : []
  const isValidationError = (k) => validationErrors.includes(k)

  if (errorKinds.every(isValidationError)) {
    const formatted = new ApolloBadRequest(err.message)
    err.extensions.status = formatted.extensions.status
    err.extensions.code = formatted.extensions.code
    return err
  }

  return err
}

const errorHandlerApollo = (logger: Logger) => (err: GraphQLError) => {
  err = reformatError(err)

  const { code, status, message, ctx, ...properties } = err.extensions

  const level = getLevel(status, code)

  err.stack = err.extensions.exception.stacktrace.join('\n')

  if (level) {
    logger[level](err.message, {
      err,
      errorCode: code ?? message,
      errorMessage: message,
      errorProperties: properties,
      errorStatus: status,
      requestId: ctx?.requestId,
      userId: ctx?.userId,
    })
  }

  delete err.stack
  return err
}

export { errorHandlerApollo }
