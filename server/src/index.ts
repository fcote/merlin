import { knexDriver } from '@drivers/knex'
import { scheduler } from '@drivers/scheduler'

import { app } from './app'
import { ServiceManager } from './manager'

const manager = new ServiceManager({
  logger: null,
  safeExit: 200, // let 200 ms before the app call process.exit
  subscribe: [
    'SIGINT',
    'SIGTERM',
    ['unhandledRejection', { log: true, logLevel: 'error' }],
    ['uncaughtException', { log: true, logLevel: 'error' }],
  ],
})

void manager
  .connect('knex', knexDriver, { timeout: 90 * 60 * 1000 })
  .connect('scheduler', scheduler, { timeout: 15 * 1000 })
  .connect('server', app, { timeout: 15 * 1000 })
  .ready()

export { app }
