import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { Logger } from 'winston'

import { getLevel } from '@middlewares/http/errorHandler'

const errorHandlerApollo =
  (logger: Logger) =>
  (formatted: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
    const err = error instanceof GraphQLError ? error : undefined
    const { code, status, message, ctx, ...properties } =
      formatted.extensions ?? {}
    const level = getLevel(status as number, code as string)
    if (level) {
      logger[level](formatted.message, {
        err: err?.originalError ?? err,
        errorCode: code ?? message,
        errorMessage: message,
        errorProperties: properties,
        errorStatus: status,
        requestId: (ctx as any)?.requestId,
        userId: (ctx as any)?.userId,
      })
    }
    return formatted
  }

export { errorHandlerApollo }
