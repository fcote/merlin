import { Financial } from '@models/financial'
import { RequestContext } from '@typings/context'

class FinancialFieldsResolver {
  async security(financial: Financial, ctx: RequestContext) {
    return ctx.loaders!.financialSecurity.load(financial.securityId)
  }

  async financialItem(financial: Financial, ctx: RequestContext) {
    return ctx.loaders!.financialFinancialItem.load(financial.financialItemId)
  }

  async performance(financial: Financial, ctx: RequestContext) {
    return ctx.loaders!.financialPerformance.load(financial.id)
  }
}

export { FinancialFieldsResolver }
