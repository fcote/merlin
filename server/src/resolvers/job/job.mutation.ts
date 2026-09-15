import { JobType } from '@models/job'
import { JobService } from '@services/job'
import { RequestContext } from '@typings/context'

class JobMutationResolver {
  executeJob(ctx: RequestContext, type: JobType) {
    return new JobService(ctx)[type]()
  }
}

export { JobMutationResolver }
