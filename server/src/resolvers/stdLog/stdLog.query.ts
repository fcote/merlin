import { Arg, Ctx, Resolver, Query, Authorized } from 'type-graphql'

import { PaginatedStdLog } from '@models/stdLog'
import { Right } from '@resolvers'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { StdLogService } from '@services/stdLog'
import { RequestContext } from '@typings/context'

@Resolver()
class StdLogQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => PaginatedStdLog)
  stdLogs(
    @Ctx() ctx: RequestContext,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ) {
    return new StdLogService(ctx).find(paginate, orderBy)
  }
}

export { StdLogQueryResolver }
