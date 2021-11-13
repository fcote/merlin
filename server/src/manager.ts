import { logger } from '@logger'
import {
  DriverConfig,
  ManagerConfig,
  Driver,
  EventConfig,
} from '@typings/manager'

const DEFAULT_MANAGER_CONFIG: ManagerConfig = {
  logger: console,
  exitFunction: process.exit,
  subscribe: [
    'SIGTERM',
    'unhandledRejection',
    ['uncaughtException', { strategy: 'hard' }],
  ],
  debug: false,
}

const DEFAULT_EVENT_CONFIG: EventConfig = {
  logLevel: 'info',
  strategy: 'graceful',
  exitStatus: 1,
}

const DEFAULT_DRIVER_CONFIG: DriverConfig = {
  timeout: 1000,
  maxRetry: 5,
}

class TimeoutError extends Error {
  constructor(name: string) {
    super(`Error closing ${name} timeout exceeded`)
  }
}

class ServiceManager {
  config: ManagerConfig
  drivers: Driver[]
  connectedDrivers: Driver[]

  constructor(config: ManagerConfig) {
    this.config = { ...DEFAULT_MANAGER_CONFIG, ...config }
    this.drivers = []
    this.connectedDrivers = []

    this.listen()
  }

  exit = (code: number) => {
    if (this.config.safeExit) {
      setTimeout(() => this.config.exitFunction?.(code), this.config.safeExit)
    } else {
      this.config.exitFunction?.(code)
    }
  }

  listen = () => {
    this.config.subscribe?.forEach((event) => {
      let eventName
      let eventConfig = DEFAULT_EVENT_CONFIG

      if (typeof event === 'string') {
        eventName = event
      } else {
        eventName = event[0]
        eventConfig = { ...eventConfig, ...event[1] }
      }

      process.on(eventName, async (...args) => {
        if (eventConfig.log) {
          logger[eventConfig.logLevel!](...args)
        }

        if (eventConfig.strategy === 'graceful') {
          await this.disconnect()
        }
        this.exit(eventConfig.exitStatus!)
      })
    })
  }

  private execTimeout = (promise: Promise<void>, delay: number) => {
    return new Promise<void>((resolve, reject) => {
      let resolved = false
      let timeout: NodeJS.Timeout | null

      timeout = setTimeout(() => {
        timeout = null
        if (!resolved) {
          reject(new TimeoutError('Timeout error'))
        }
      }, delay)

      promise
        .then(() => {
          resolved = true
          if (timeout) {
            clearTimeout(timeout)
            resolve()
          }
          return resolved
        })
        .catch((err) => {
          resolved = true
          if (timeout) {
            clearTimeout(timeout)
            reject(err)
          }
        })
    })
  }

  private sleep = (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  connect = (name: string, connector: any, driverConfig: DriverConfig) => {
    this.drivers.push({
      name,
      connector,
      config: { ...DEFAULT_DRIVER_CONFIG, ...driverConfig },
    })

    return this
  }

  disconnect = async () => {
    for (const driver of [...this.connectedDrivers].reverse()) {
      try {
        await this.try(driver, 'disconnect')
        this.config.debug &&
          logger.debug(`Service Manager > ${driver.name} disconnected`)
      } catch (err) {
        logger.error(err)
        return err
      }
    }
    return null
  }

  ready = async () => {
    for (const driver of this.drivers) {
      await this.try(driver, 'connect')
      this.config.debug &&
        logger.debug(`Service Manager > ${driver.name} connected`)
      this.connectedDrivers.push(driver)
    }

    logger.info('Merlin server started')
  }

  private try = async (driver: Driver, to: 'connect' | 'disconnect') => {
    let nTries = 0
    let success = false

    const tryTo = async () => {
      try {
        await this.execTimeout(driver.connector[to](), driver.config.timeout)
        success = true
      } catch (error: any) {
        logger.warn(`Failed to ${to} driver ${driver.name}, retrying...`, {
          err: {
            message: error.message,
            stack: error.stack,
          },
        })
      }
    }

    while (!success && nTries <= driver.config.maxRetry!) {
      nTries += 1
      await tryTo()
      if (!success && nTries <= driver.config.maxRetry!) await this.sleep(5000)
    }

    if (!success) {
      throw new Error(
        `Failed to ${to} driver ${driver.name}, max number of retry reached`
      )
    }
  }
}

export { ServiceManager }
