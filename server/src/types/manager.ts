export interface Connectable {
  connect(): Promise<void>

  disconnect(): Promise<void>
}

export type ManagerConfig = {
  debugName?: string
  logger?: any
  exitFunction?: Function
  safeExit?: number
  subscribe?: any[]
  debug?: boolean
}

export type EventConfig = {
  log?: boolean
  logLevel?: string
  strategy?: string
  exitStatus?: number
}

export type Driver = {
  name: string
  connector: Connectable
  config: DriverConfig
}

export type DriverConfig = {
  timeout?: number
  maxRetry?: number
}
