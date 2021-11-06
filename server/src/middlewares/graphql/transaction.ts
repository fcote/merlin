import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  BaseContext as ApolloBaseContext,
} from 'apollo-server-plugin-base'
import { Knex } from 'knex'
import { Logger } from 'winston'

type TransactionPluginConfig = {
  knex: Knex
  logger?: Logger
  transactionTimeoutMs?: number
  transactionConfig?: Knex.TransactionConfig
}

type BaseContext = ApolloBaseContext & {
  trx?: Knex.Transaction
  trxStartPromise?: Promise<Knex.Transaction>
  trxTimeout?: NodeJS.Timeout
}

class TransactionPlugin<C extends BaseContext = BaseContext>
  implements ApolloServerPlugin<C>
{
  constructor(private config: TransactionPluginConfig) {}

  private setTransactionInContext(context: C, trx?: Knex.Transaction) {
    context.trx = trx
  }

  private async start(context: C) {
    // Start the actual transaction
    context.trxStartPromise = new Promise<Knex.Transaction>(
      async (resolve, reject) => {
        try {
          const trx = await this.config.knex.transaction(
            this.config?.transactionConfig
          )
          this.setTransactionInContext(context, trx)
          resolve(trx)
        } catch (err) {
          reject(err)
        }
      }
    )
    await context.trxStartPromise

    // Set a timeout to kill the transaction if it takes too long
    if (this.config?.transactionTimeoutMs) {
      context.trxTimeout = setTimeout(
        this.timeout,
        this.config.transactionTimeoutMs,
        context,
        this.config.logger
      )
    }
  }

  private async timeout(context: C, logger?: Logger) {
    logger?.warn('knex > terminating stuck transaction')
    await this.abort(context)
  }

  private async commit(context: C) {
    if (!context.trx || context.trx.isCompleted()) return
    await context.trx.commit()
    this.cleanup(context)
  }

  private async abort(context: C) {
    if (!context.trx || context.trx.isCompleted()) return
    await context.trx.rollback()
    this.cleanup(context)
  }

  private cleanup(context: C) {
    if (context.trxTimeout) {
      clearTimeout(context.trxTimeout)
    }
    this.setTransactionInContext(context)
  }

  async requestDidStart(): Promise<GraphQLRequestListener<C>> {
    return {
      didResolveOperation: async ({ context }) => {
        await this.start(context)
      },
      didEncounterErrors: async ({ context }) => {
        await this.abort(context)
      },
      willSendResponse: async ({ context }) => {
        await this.commit(context)
      },
    }
  }
}

export { TransactionPlugin, TransactionPluginConfig }
