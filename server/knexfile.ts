import { Knex } from 'knex'

import { config } from './src/config'

require('tsconfig-paths/register')

const pgConnection = config.get('database')

const dbConfig: Knex.Config = {
  client: 'pg',
  connection: pgConnection,
  pool: {
    min: config.get('database.poolMin'),
    max: config.get('database.poolMax'),
    acquireTimeoutMillis: config.get('database.acquireConnectionTimeout'),
    idleTimeoutMillis: config.get('database.idleTimeoutMillis'),
  },
  migrations: {
    tableName: 'knex_migrations',
  },
  asyncStackTraces: true,
}

export default dbConfig
