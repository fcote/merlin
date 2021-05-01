import { Knex, knex as knexInit } from 'knex'
import { Model, knexSnakeCaseMappers } from 'objection'
import pg from 'pg'

import { config } from '@config'
import { Connectable } from '@typings/manager'

import dbConfig from '../../knexfile'

const knexConfig = { ...dbConfig, ...knexSnakeCaseMappers() }
pg.types.setTypeParser(1700, parseFloat)

class KnexDriver implements Connectable {
  public knex: Knex
  private migrationConfig: { enable: boolean; dir: string }

  constructor() {
    this.knex = knexInit(knexConfig)
    this.migrationConfig = config.get('database.migration')
    Model.knex(this.knex)
  }

  public connect = async (): Promise<void> =>
    this.migrationConfig.enable &&
    this.knex.migrate.latest({ directory: this.migrationConfig.dir })

  public disconnect = async (): Promise<void> => this.knex.destroy()
}

const knexDriver = new KnexDriver()

export { KnexDriver, knexDriver }
