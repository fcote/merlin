import { config } from './src/config'
import { DBConfig } from './src/types/db'

require('tsconfig-paths/register')

const pgConnection = config.get('database')

const dbConfig: DBConfig = {
  client: 'pg',
  connection: pgConnection,
  pool: {
    min: config.get('database.poolMin'),
    max: config.get('database.poolMax'),
  },
  acquireConnectionTimeout: config.get('database.acquireConnectionTimeout'),
  migrations: {
    tableName: 'knex_migrations',
  },
  asyncStackTraces: true,
}

export default dbConfig
