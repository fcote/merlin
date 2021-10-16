import { Knex } from 'knex'

import { User } from '@models/user'
import { DataloaderService } from '@services/dataloader'

type RequestContext = {
  user?: User
  userToken?: string
  loaders?: DataloaderService
  trx?: Knex.Transaction
  trxTimeout?: NodeJS.Timeout
  trxStartPromise?: Promise<Knex.Transaction>
}

export { RequestContext }
