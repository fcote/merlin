import { init, setExtras, captureException } from '@sentry/node'
import { get, isNumber } from 'lodash'
import os from 'os'
import winston from 'winston'
import Transport from 'winston-transport'

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

class SentryTransport extends Transport {
  // @ts-ignore
  private name: string
  private options: { env: string; version: string }
  private shouldLogStatuses: number[]
  private readonly token: string
  private readonly logSeverity: number

  constructor(
    token: string,
    level: string,
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

  getCode(err) {
    function isHttpCode(code) {
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

  getError(data) {
    if (data.message instanceof Error) return data.message

    return data.err ?? data.error
  }

  /**
   * Log events from winston
   */
  log(info, callback) {
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
  level: string
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
        data,
      })
      .catch(() => {
        return
      })

    next()
  }
}

const transports: Transport[] = [
  new winston.transports.Console(),
  new DatabaseTransport(),
]

if (config.get('sentry.enabled')) {
  const sentryTransport = new SentryTransport(
    config.get('sentry.dsn'),
    config.get('sentry.level'),
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
