import { execute, GraphQLError } from 'graphql'
import type { Plugin } from 'graphql-yoga'
import { Knex } from 'knex'

import { config } from '@config'
import { knexDriver } from '@knex'
import { logger } from '@logger'
import { errorHandlerApollo } from '@middlewares/http/errorHandlerApollo'
import { DataloaderService } from '@services/dataloader'
import { RequestContext } from '@typings/context'

// One transaction and one loader set per operation. Finish the transaction
// before Yoga can send a response, including partial-data resolver failures.
export const useOperationTransaction = (): Plugin<RequestContext> => ({
  onExecute({ setExecuteFn }) {
    setExecuteFn(async (args) => {
      const context = args.contextValue as RequestContext
      const trx: Knex.Transaction = await knexDriver.knex.transaction()
      context.trx = trx
      let timedOut = false
      const timeoutMs = config.get('database.idleInTransactionTimeout')
      const timeout =
        timeoutMs > 0
          ? setTimeout(() => {
              timedOut = true
              logger.warn('knex > terminating stuck transaction')
              void trx.rollback().catch((error) => logger.error(error))
            }, timeoutMs)
          : undefined

      try {
        context.loaders = new DataloaderService(context)
        // Keep the existing single-result contract; graphql-ws owns subscriptions.
        const result = await execute(args)
        if (timedOut) throw new GraphQLError('Operation transaction timed out')
        if (result.errors?.length) {
          await trx.rollback()
          const format = errorHandlerApollo(logger)
          return {
            ...result,
            errors: result.errors.map(
              (error) =>
                new GraphQLError(error.message, {
                  nodes: error.nodes,
                  path: error.path,
                  originalError: error.originalError,
                  extensions: format(
                    {
                      ...error.toJSON(),
                      extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        ...error.extensions,
                      },
                    },
                    error
                  ).extensions,
                })
            ),
          }
        }
        await trx.commit()
        return result
      } catch (error) {
        if (!trx.isCompleted()) await trx.rollback()
        throw error
      } finally {
        if (timeout) clearTimeout(timeout)
        context.trx = undefined
      }
    })
  },
})
