import {
  Arg,
  Ctx,
  Resolver,
  Query,
  Authorized,
  ID,
  FieldResolver,
} from 'type-graphql'

import { PaginatedEarning, EarningStatement } from '@models/earning'
import { Right } from '@resolvers'
import { EarningFilters } from '@resolvers/earning/earning.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { SelfQuery } from '@resolvers/root'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { EarningService } from '@services/earning'
import { RequestContext } from '@typings/context'

@Resolver()
class EarningQueryResolver {
  @Authorized([Right.authenticated])
  @Query((_) => PaginatedEarning)
  earnings(
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => EarningFilters, { nullable: true })
    filters?: EarningFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedEarning> {
    return new EarningService(ctx).find(filters, paginate, orderBy)
  }

  @Authorized([Right.authenticated])
  @Query((_) => [EarningStatement], { nullable: true })
  earningCallTranscript(
    @Ctx() ctx: RequestContext,
    @Arg('earningId', (_) => ID) earningId: number | string
  ): Promise<EarningStatement[]> {
    return new EarningService(ctx).callTranscript(earningId)
  }
}

@Resolver(SelfQuery)
class SelfEarningQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => PaginatedEarning)
  async earnings(
    @Ctx() ctx: RequestContext,
    @Arg('filters', (_) => EarningFilters, { nullable: true })
    filters?: UserAccountFilters,
    @Arg('paginate', (_) => PaginationOptions, { nullable: true })
    paginate?: PaginationOptions,
    @Arg('orderBy', (_) => [OrderOptions], { nullable: true })
    orderBy?: OrderOptions[]
  ): Promise<PaginatedEarning> {
    return new EarningService(ctx).find(
      {
        ...filters,
        userId: ctx.user.id,
      },
      paginate,
      orderBy
    )
  }
}

export { EarningQueryResolver, SelfEarningQueryResolver }
