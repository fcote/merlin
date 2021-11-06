import { Knex, knex as knexInit } from 'knex'
import { Model, knexSnakeCaseMappers } from 'objection'
import pg from 'pg'

import { config } from '@config'
import { logger } from '@logger'
import { Connectable } from '@typings/manager'

import dbConfig from '../../knexfile'

const knexConfig = { ...dbConfig, ...knexSnakeCaseMappers() }
pg.types.setTypeParser(1700, parseFloat)

class KnexDriver implements Connectable {
  public knex: Knex
  private migrationConfig: { enable: boolean; dir: string }
  private queries: Record<
    string,
    { sql: string; bindings: any; start: number }
  > = {}

  constructor() {
    this.knex = knexInit(knexConfig)
    this.migrationConfig = config.get('database.migration')
    Model.knex(this.knex)

    if (config.get('database.monitorQueries')) {
      this.monitorQueries()
    }
  }

  public connect = async () =>
    this.migrationConfig.enable &&
    this.knex.migrate.latest({ directory: this.migrationConfig.dir })

  public disconnect = async () => this.knex.destroy()

  public monitorQueries = () => {
    this.knex.on('query', (query) => {
      this.queries[query.__knexQueryUid] = {
        sql: query.sql,
        bindings: query.bindings,
        start: Date.now(),
      }
    })
    this.knex.on('query-response', (_, query) => {
      const q = this.queries[query.__knexQueryUid]
      const durationMs = Date.now() - q.start
      if (durationMs > 100) {
        logger.info('query duration', {
          sql: q.sql,
          bindings: q.bindings,
          durationMs,
        })
      }
      delete this.queries[query.__knexQueryUid]
    })
  }
}

const knexDriver = new KnexDriver()

export { KnexDriver, knexDriver }
