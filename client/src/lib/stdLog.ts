export enum StdLogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export const getStdLogLevelColor = (level: StdLogLevel) => {
  switch (level) {
    case StdLogLevel.debug:
      return 'lime'
    case StdLogLevel.info:
      return 'cyan'
    case StdLogLevel.warn:
      return 'orange'
    case StdLogLevel.error:
      return 'red'
  }
}

export default interface StdLog {
  id: string
  message: string
  level: StdLogLevel
  data: any
  createdAt: string
}
