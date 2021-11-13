import { FieldList } from '@resolvers/fields'
import {
  FinancialFilters,
  FinancialSyncSecurityFields,
  FinancialSyncSectorFields,
} from '@resolvers/financial/financial.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FinancialPerformanceMethod } from '@services/financial/attributes/performance'
import { FinancialFindMethod } from '@services/financial/find'
import { FinancialSyncSectorMethod } from '@services/financial/syncSector'
import { FinancialSyncSecurityMethod } from '@services/financial/syncSecurity'
import { SecuritySyncEmitter } from '@services/security/sync'
import { Service } from '@services/service'

class FinancialService extends Service {
  attributes = {
    performance: async (financialIds: readonly (number | string)[]) =>
      new FinancialPerformanceMethod(this).run(financialIds),
  }

  find = async (
    filters?: FinancialFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[],
    fields?: FieldList
  ) => new FinancialFindMethod(this).run(filters, paginate, orderBy, fields)

  syncSecurity = async (
    inputs: FinancialSyncSecurityFields,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) =>
    new FinancialSyncSecurityMethod(this).run(
      inputs,
      securitySyncEmitter,
      targetProgress
    )
  syncSector = async (inputs: FinancialSyncSectorFields) =>
    new FinancialSyncSectorMethod(this).run(inputs)
}

export { FinancialService }
