import { Arg, Ctx, Resolver, Mutation, Authorized } from 'type-graphql'

import { JobType } from '@models/job'
import { Right } from '@resolvers'
import { JobService } from '@services/job'
import { RequestContext } from '@typings/context'

@Resolver()
class JobMutationResolver {
  @Authorized([Right.authenticated])
  @Mutation((_) => Boolean)
  executeJob(
    @Ctx() ctx: RequestContext,
    @Arg('type', (_) => JobType) type: JobType
  ) {
    return new JobService(ctx)[type]()
  }
}

export { JobMutationResolver }
