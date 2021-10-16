import { PartialModelGraph } from 'objection'

import { handleError } from '@middlewares/http/errorHandler'
import { Job, JobType } from '@models/job'
import { JobEarningSubscribedMethod } from '@services/job/earningsSubscribed'
import { JobForexMethod } from '@services/job/forex'
import { JobFullSyncMethod } from '@services/job/fullSync'
import { JobHistoricalPricesEndOfDayMethod } from '@services/job/historicalPricesEndOfDay'
import { JobNewsMethod } from '@services/job/news'
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

  fullSync = () =>
    this.jobRunner(JobType.fullSync, new JobFullSyncMethod(this).run)
  historicalPricesEndOfDay = () =>
    this.jobRunner(
      JobType.historicalPricesEndOfDay,
      new JobHistoricalPricesEndOfDayMethod(this).run
    )
  forex = () => this.jobRunner(JobType.forex, new JobForexMethod(this).run)
  news = () => this.jobRunner(JobType.news, new JobNewsMethod(this).run)
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
