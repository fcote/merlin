import { init, setExtras, captureException } from '@sentry/node'
import { ApolloError } from 'apollo-server-core'
import { get, isNumber, pick, cloneDeep } from 'lodash'
import os from 'os'
import winston, { LogCallback } from 'winston'
import Transport from 'winston-transport'
import { ConsoleTransportOptions } from 'winston/lib/winston/transports'

import { config } from '@config'
import { StdLog } from '@models/stdLog'

/**
 * overrides for winston logging levels
 */
const sentryLogLevels = {
  crit: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

const serializeErrors = (data: Record<string, any>): any => {
  const serialize = (error: Error) => {
    if (error instanceof ApolloError) return error
    return {
      message: error.message,
      stacktrace: error.stack,
    }
  }

  data = cloneDeep(data)
  Object.keys(pick(data, ['err', 'error'])).forEach((key) => {
    data[key] = serialize(data[key])
  })
  return data
}

class SentryTransport extends Transport {
  // @ts-ignore
  private name: string
  private options: { env: string; version: string }
  private shouldLogStatuses: number[]
  private readonly token: string
  private readonly logSeverity: number

  constructor(
    token: string,
    level: 'crit' | 'error' | 'warn' | 'info' | 'debug',
    options: { env: string; version: string }
  ) {
    super()
    this.name = 'sentry'
    this.options = options
    this.token = token
    this.logSeverity = sentryLogLevels[level]
    this.shouldLogStatuses = [400, 500]

    const version = options.version

    if (!this.token) {
      throw new Error(
        'Logger - Missing dsn in sentry options. It is required when sentry is enabled'
      )
    }

    if (!this.logSeverity) {
      throw new Error(`Logger - Incorrect log level provided: ${level}`)
    }

    init({
      dsn: this.token,
      release: version,
      environment: this.options.env,
      serverName: os.hostname(),
    })
  }

  getCode(err: any) {
    function isHttpCode(code: number) {
      return isNumber(code) && code > 100 && code < 600
    }

    if (get(err, 'status') && isHttpCode(err.status)) {
      // Standard errors status
      return err.status
    }
    if (get(err, 'code') && isHttpCode(err.code)) {
      // Legacy errors status
      return err.code
    }
    if (get(err, 'extensions.status') && isHttpCode(err.extensions.status)) {
      // GraphQL errors status
      return err.extensions.status
    }

    return 500
  }

  getError(data: Omit<LogInfo, 'level'>) {
    if (data.message instanceof Error) return data.message

    return data.err ?? data.error
  }

  /**
   * Log events from winston
   */
  log(info: LogInfo, callback: LogCallback) {
    setImmediate(() => this.emit('logged', info))

    const { level, ...data } = info
    if (!data) {
      callback()
      return
    }

    const err = this.getError(data)
    if (!err || sentryLogLevels[level] > this.logSeverity) {
      callback()
      return
    }

    const code = this.getCode(err)
    if (!this.shouldLogStatuses.includes(code)) {
      callback()
      return
    }

    setExtras(data)
    captureException(err)

    callback()
  }
}

type LogInfo = Record<string, any> & {
  level: 'crit' | 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string
}

class DatabaseTransport extends Transport {
  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts)
  }

  log(info: LogInfo, next: () => void) {
    let { level, message, timestamp: _, ...data } = info

    if (message.length > 255) {
      message = `${message.substring(0, 252)}...`
    }

    StdLog.query()
      .insert({
        level,
        message,
        data: serializeErrors(data),
      })
      .catch(() => {
        return
      })

    next()
  }
}

class ConsoleTransport extends winston.transports.Console {
  constructor(options?: ConsoleTransportOptions) {
    super(options)
  }

  log(info: LogInfo, next: () => void) {
    return super.log?.(serializeErrors(info), next)
  }
}

const transports: Transport[] = [
  new ConsoleTransport(),
  new DatabaseTransport(),
]

if (config.get('sentry.enabled')) {
  const sentryTransport = new SentryTransport(
    config.get('sentry.dsn'),
    config.get('sentry.level') as 'crit' | 'error' | 'warn' | 'info' | 'debug',
    {
      version: config.get('app.version'),
      env: config.get('env'),
    }
  )
  transports.push(sentryTransport)
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports,
})

export { logger }
