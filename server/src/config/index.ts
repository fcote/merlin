import convict from 'convict'
import fs from 'fs'

const {
  name: packageName,
  version: packageVersion,
}: Record<string, string> = require('../../package.json')

const schema = {
  env: {
    doc: 'The application environment',
    format: ['local', 'prod'],
    default: 'local',
    env: 'ENV',
  },
  app: {
    id: {
      default: packageName,
    },
    version: {
      default: packageVersion,
    },
  },
  endpoint: {
    default: 'http://localhost:3000',
    env: 'ENDPOINT',
  },
  timezone: {
    default: 'America/New_York',
    env: 'TIMEZONE',
  },
  port: {
    doc: 'The api port',
    default: 3000,
    env: 'SERVER_PORT',
  },
  keepAliveTimeout: {
    doc: 'The keep alive timeout of the server',
    default: 90 * 1000,
    env: 'KEEP_ALIVE_TIMEOUT',
  },
  graphql: {
    debug: {
      doc: 'Activate apollo debug',
      default: true,
      env: 'APOLLO_DEBUG',
    },
  },
  database: {
    host: {
      default: 'localhost',
      env: 'DATABASE_HOST',
    },
    port: {
      default: '5432',
      env: 'DATABASE_PORT',
    },
    database: {
      default: 'merlin',
      env: 'DATABASE_NAME',
    },
    user: {
      default: 'postgres',
      env: 'DATABASE_USER',
    },
    password: {
      default: 'postgres',
      env: 'DATABASE_PASSWORD',
    },
    migration: {
      enable: {
        default: true,
        env: 'DATABASE_MIGRATION_ENABLE',
      },
      dir: {
        default: './migrations',
        env: 'DATABASE_MIGRATION_DIR',
      },
    },
    poolMin: {
      default: 1,
      env: 'DATABASE_POOL_MIN',
    },
    poolMax: {
      default: 10,
      env: 'DATABASE_POOL_MAX',
    },
    acquireConnectionTimeout: {
      default: 60000,
      env: 'DATABASE_ACQUIRE_CONNECTION_TIMEOUT',
    },
    idleInTransactionTimeout: {
      default: 60000,
      env: 'DATABASE_IDLE_IN_TRANSACTION_TIMEOUT',
    },
    idleTimeoutMillis: {
      default: 15000,
      env: 'DATABASE_IDLE_TIMEOUT_MILLIS',
    },
    monitorQueries: {
      default: false,
      env: 'DATABASE_MONITOR_QUERIES',
    },
  },
  pubsub: {
    maxListeners: {
      default: 200,
      env: 'PUBSUB_MAX_LISTENERS',
    },
  },
  sentry: {
    enabled: {
      default: false,
      env: 'SENTRY_ENABLED',
    },
    dsn: {
      default: '',
      env: 'SENTRY_DSN',
    },
    level: {
      default: 'error',
    },
  },
  scheduler: {
    pricesSubscribed: {
      enabled: {
        env: 'SCHEDULER_PRICES_SUBSCRIBED_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_PRICES_SUBSCRIBED_RULE',
        default: '* * * * *',
      },
    },
    newsSubscribed: {
      enabled: {
        env: 'SCHEDULER_NEWS_SUBSCRIBED_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_NEWS_SUBSCRIBED_RULE',
        default: '* * * * *',
      },
    },
    earningsSubscribed: {
      enabled: {
        env: 'SCHEDULER_EARNINGS_SUBSCRIBED_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_EARNINGS_SUBSCRIBED_RULE',
        default: '* * * * *',
      },
    },
  },
  datasource: {
    fmp: {
      key: {
        default: '',
        env: 'EXTERNAL_API_FMP_KEY',
      },
      plan: {
        default: 'free',
        env: 'EXTERNAL_API_FMP_PLAN',
        format: ['free', 'premium'],
      },
    },
  },
  links: {
    financials: {
      default: 'macrotrends',
      env: 'FINANCIALS_LINK',
      format: ['fmp', 'macrotrends'],
    },
    earnings: {
      default: 'yahooFinance',
      env: 'EARNINGS_LINK',
      format: ['fmp', 'yahooFinance'],
    },
  },
  features: {
    allowUserSignUp: {
      default: true,
      env: 'FEATURES_ALLOW_USER_SIGN_UP',
    },
  },
}

const config = convict(schema)

// validate env before loading file
config.validate({ allowed: 'strict' })

config.loadFile(`${__dirname}/config.${config.get('env')}.json`)

// private file management
{
  const privateFile = `${__dirname}/config.${config.get('env')}.private.json`
  if (fs.existsSync(privateFile)) {
    config.loadFile(privateFile)
  }
}
// validate all
config.validate({ allowed: 'strict' })

export { config }
