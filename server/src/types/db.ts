export type PoolConfig = {
  min: number
  max: number
}

export type MigrationConfig = {
  tableName: string
}

export type DBConfig = {
  client: string
  connection: any
  acquireConnectionTimeout: number
  pool: PoolConfig
  migrations: MigrationConfig
  asyncStackTraces: boolean
}
