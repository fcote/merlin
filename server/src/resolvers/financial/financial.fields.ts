import { CacheScope } from 'apollo-server-types'
import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Financial, FinancialPerformance } from '@models/financial'
import { FinancialItem } from '@models/financialItem'
import { Security } from '@models/security'
import { CacheControl } from '@resolvers/cacheControl'
import { RequestContext } from '@typings/context'

@Resolver(Financial)
class FinancialFieldsResolver {
  @CacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
  @FieldResolver((_) => Security)
  async security(@Root() financial: Financial, @Ctx() ctx: RequestContext) {
    return ctx.loaders!.financialSecurity.load(financial.securityId)
  }

  @CacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
  @FieldResolver((_) => FinancialItem)
  async financialItem(
    @Root() financial: Financial,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.loaders!.financialFinancialItem.load(financial.financialItemId)
  }

  @CacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
  @FieldResolver((_) => FinancialPerformance, { nullable: true })
  async performance(@Root() financial: Financial, @Ctx() ctx: RequestContext) {
    return ctx.loaders!.financialPerformance.load(financial.id)
  }
}

export { FinancialFieldsResolver }
