import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { searchLink } from '@links/links'
import { Security, SecuritySearch } from '@models/security'
import { Right } from '@resolvers'
import { SecurityService } from '@services/security'
import { RequestContext } from '@typings/context'

@Resolver()
class SecurityQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => [SecuritySearch])
  searchSecurity(@Arg('ticker') ticker: string): Promise<SecuritySearch[]> {
    return searchLink.search(ticker)
  }

  @Authorized([Right.authenticated])
  @Query((_) => Security, { nullable: true })
  security(
    @Arg('ticker', (_) => String) ticker: string,
    @Ctx() ctx: RequestContext
  ) {
    return new SecurityService(ctx).findOne({ ticker })
  }
}

export { SecurityQueryResolver }
