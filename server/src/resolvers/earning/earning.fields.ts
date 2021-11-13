import { CacheScope } from 'apollo-server-types'
import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Earning } from '@models/earning'
import { Security } from '@models/security'
import { CacheControl } from '@resolvers/cacheControl'
import { RequestContext } from '@typings/context'

@Resolver(Earning)
class EarningFieldsResolver {
  @CacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
  @FieldResolver((_) => Security)
  async security(@Root() earning: Earning, @Ctx() ctx: RequestContext) {
    return ctx.loaders!.earningSecurity.load(earning.securityId)
  }
}

export { EarningFieldsResolver }
