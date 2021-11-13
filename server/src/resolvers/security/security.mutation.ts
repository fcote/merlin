import { Arg, Ctx, Resolver, Mutation, Authorized } from 'type-graphql'

import { Security } from '@models/security'
import { Right } from '@resolvers'
import { SecurityService } from '@services/security'
import { RequestContext } from '@typings/context'

@Resolver()
class SecurityMutationResolver {
  @Authorized([Right.authenticated])
  @Mutation((_) => Security)
  async syncSecurity(
    @Arg('ticker') ticker: string,
    @Ctx() ctx: RequestContext
  ) {
    const result = await new SecurityService(ctx).sync({ ticker })
    return result.security
  }

  @Authorized([Right.authenticated])
  @Mutation((_) => [Security])
  async syncSecurityPrices(
    @Arg('tickers', (_) => [String]) tickers: string[],
    @Ctx() ctx: RequestContext
  ) {
    return new SecurityService(ctx).syncPrices(tickers)
  }
}

export { SecurityMutationResolver }
