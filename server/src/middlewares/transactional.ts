import { Knex } from 'knex'
import { Context } from 'koa'

const transactional = (knex: Knex) => {
  return async (ctx: Context, next: Function) => {
    await knex.transaction(async (trx) => {
      ctx.state.trx = trx
      await next()
    })
  }
}

export { transactional }
