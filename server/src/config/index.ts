import convict from 'convict'
import fs from 'fs'

const pkg = require('../../package.json')

const schema = {
  env: {
    doc: 'The application environment',
    format: ['local', 'prod'],
    default: 'local',
    env: 'ENV',
  },
  app: {
    id: {
      default: pkg.name,
    },
    version: {
      default: pkg.version,
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
    tracing: {
      doc: 'Activate the apollo tracing feature',
      default: false,
      env: 'APOLLO_TRACING',
    },
  },
  database: {
    host: {
      default: 'localhost',
      env: 'DB_HOST',
    },
    port: {
      default: '5432',
      env: 'DB_PORT',
    },
    database: {
      default: 'merlin',
      env: 'DB_NAME',
    },
    user: {
      default: 'postgres',
      env: 'DB_USER',
    },
    password: {
      default: 'postgres',
      env: 'DB_PASS',
    },
    migration: {
      enable: {
        default: true,
        env: 'DB_MIGRATION_ENABLE',
      },
      dir: {
        default: './migrations',
        env: 'DB_MIGRATION_DIR',
      },
    },
    poolMin: {
      default: 1,
      env: 'DB_POOL_MIN',
    },
    poolMax: {
      default: 10,
      env: 'DB_POOL_MAX',
    },
    acquireConnectionTimeout: {
      default: 60000,
      env: 'DB_ACQUIRE_CONNECTION_TIMEOUT',
    },
    idleInTransactionTimeout: {
      default: 60000,
      env: 'DB_IDLE_IN_TRANSACTION_TIMEOUT',
    },
    idleTimeoutMillis: {
      default: 15000,
      env: 'DB_IDLE_TIMEOUT_MILLIS',
    },
    monitorQueries: {
      default: false,
      env: 'DB_MONITOR_QUERIES',
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
    historicalPricesEndOfDay: {
      enabled: {
        env: 'SCHEDULER_HISTORICAL_PRICES_END_OF_DAY_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_HISTORICAL_PRICES_END_OF_DAY_RULE',
        default: '0 20 * * 1,2,3,4,5',
      },
    },
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
    forex: {
      enabled: {
        env: 'SCHEDULER_FOREX_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_FOREX_RULE',
        default: '* * * * *',
      },
    },
    news: {
      enabled: {
        env: 'SCHEDULER_NEWS_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_NEWS_RULE',
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
    fullSync: {
      enabled: {
        env: 'SCHEDULER_FULL_SYNC_ENABLED',
        default: true,
      },
      rule: {
        env: 'SCHEDULER_FULL_SYNC_RULE',
        default: '0 22 * * 1,2,3,4,5',
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
