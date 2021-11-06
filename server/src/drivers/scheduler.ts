import { parseExpression } from 'cron-parser'
import {
  Job as NodeJob,
  RecurrenceRule,
  scheduleJob,
  RecurrenceSegment,
} from 'node-schedule'

import { config } from '@config'
import { logger } from '@logger'
import { JobType, Job } from '@models/job'
import { JobService } from '@services/job'
import { Connectable } from '@typings/manager'

class Scheduler implements Connectable {
  public jobs: NodeJob[] = []
  public schedulerConfig: any = config.get('scheduler')
  private jobService: JobService = new JobService({})

  public connect = async () => {
    await Job.query().patch({ isRunning: false })

    Object.values(JobType).forEach((jobType) => {
      if (!this.schedulerConfig[jobType]?.enabled) return

      const cronRule = parseExpression(this.schedulerConfig[jobType].rule)
      const rule = new RecurrenceRule()
      rule.hour = cronRule.fields.hour as RecurrenceSegment
      rule.minute = cronRule.fields.minute as RecurrenceSegment
      rule.second = cronRule.fields.second as RecurrenceSegment
      rule.dayOfWeek = cronRule.fields.dayOfWeek as RecurrenceSegment
      rule.tz = 'ETC/Utc'

      this.jobs.push(
        scheduleJob(
          this.schedulerConfig[jobType].rule,
          this.jobService[jobType]
        )
      )
    })

    logger.info('Scheduler service started', { jobsNumber: this.jobs.length })
  }

  public disconnect = async () => {
    if (!this.schedulerConfig.enabled) return

    this.jobs.forEach((j) => j.cancel())
  }
}

const scheduler = new Scheduler()

export { Scheduler, scheduler }
