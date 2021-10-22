import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import {
  SecurityFilters,
  SecurityFields,
} from '@resolvers/security/security.inputs'
import { SecurityFollowedInMethod } from '@services/security/attributes/followedIn'
import { SecurityFindMethod } from '@services/security/find'
import { SecurityFindOneMethod } from '@services/security/findOne'
import {
  SecuritySyncMethod,
  SecuritySyncEmitter,
} from '@services/security/sync'
import { SecuritySyncPricesMethod } from '@services/security/syncPrices'
import { Service } from '@services/service'

class SecurityService extends Service {
  attributes = {
    followedIn: async (securityIds: (number | string)[]) =>
      new SecurityFollowedInMethod(this).run(securityIds),
  }

  find = async (
    filters?: SecurityFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) => new SecurityFindMethod(this).run(filters, paginate, orderBy)
  findOne = async (filters: SecurityFilters) =>
    new SecurityFindOneMethod(this).run(filters)
  sync = async (inputs: SecurityFields) =>
    new SecuritySyncMethod(this).run(inputs)
  syncPrices = async (tickers: string[], syncEmitter?: SecuritySyncEmitter) =>
    new SecuritySyncPricesMethod(this).run(tickers, syncEmitter)
}

export { SecurityService }
