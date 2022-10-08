import { PartialModelGraph } from 'objection'

import { handleError } from '@middlewares/http/errorHandler'
import { Job, JobType } from '@models/job'
import { JobEarningSubscribedMethod } from '@services/job/earningsSubscribed'
import { JobNewsSubscribedMethod } from '@services/job/newsSubscribed'
import { JobPricesSubscribedMethod } from '@services/job/pricesSubscribed'
import { Service } from '@services/service'

class JobService extends Service {
  private jobRunner = async (
    type: JobType,
    method: () => Promise<void>
  ): Promise<boolean> => {
    let existingJob = await Job.query().findOne({ type })
    if (existingJob?.isRunning) {
      return false
    }

    const jobInputs = (): PartialModelGraph<Job> => ({
      ...(existingJob && { id: existingJob.id }),
      type,
    })

    existingJob = await Job.query().upsertGraphAndFetch({
      ...jobInputs(),
      isRunning: true,
    })

    method()
      .catch((err) => {
        handleError()(err)
      })
      .finally(async () => {
        await Job.query().upsertGraph({ ...jobInputs(), isRunning: false })
      })
    return true
  }

  newsSubscribed = () =>
    this.jobRunner(
      JobType.newsSubscribed,
      new JobNewsSubscribedMethod(this).run
    )
  earningsSubscribed = () =>
    this.jobRunner(
      JobType.earningsSubscribed,
      new JobEarningSubscribedMethod(this).run
    )
  pricesSubscribed = () =>
    this.jobRunner(
      JobType.pricesSubscribed,
      new JobPricesSubscribedMethod(this).run
    )
}

export { JobService }
