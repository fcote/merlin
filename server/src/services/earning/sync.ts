import { keyBy } from 'lodash'
import { PartialModelObject } from 'objection'

import { earningsLink } from '@links/links'
import { SecurityEarningResult } from '@links/types'
import { Earning } from '@models/earning'
import { Security } from '@models/security'
import { SecuritySyncEmitter } from '@services/security/sync'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'
import { DefaultErrorCodes } from '@typings/errors/errorCodes'

class EarningSyncMethod extends ServiceMethod {
  private security: Security
  private currentEarnings: Record<string, Earning>
  private securitySyncEmitter?: SecuritySyncEmitter
  private startProgress: number = 0
  private targetProgress: number = 0

  private setCurrentEarnings = async () => {
    const earnings = await Earning.query(this.trx)
      .select('id', 'date')
      .where('securityId', this.security.id)
    this.currentEarnings = keyBy(earnings, (hp) => hp.date)
  }

  private getTargetProgress = (factor: number) => {
    const progressLeft = this.targetProgress - this.startProgress
    return this.startProgress + progressLeft * factor
  }

  run = async (
    ticker: string,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) => {
    const security = await Security.query(this.trx)
      .select('id', 'fiscalYearEndMonth')
      .findOne('ticker', ticker)
    if (!security) {
      throw new ApolloResourceNotFound(DefaultErrorCodes.RESOURCE_NOT_FOUND, {
        ticker,
      })
    }

    this.security = security
    this.securitySyncEmitter = securitySyncEmitter
    this.startProgress = this.securitySyncEmitter?.currentProgress ?? 0
    this.targetProgress = targetProgress ?? 0

    await this.setCurrentEarnings()
    securitySyncEmitter?.sendProgress(this.getTargetProgress(1 / 5))

    const earningList = await earningsLink.earnings(ticker)
    securitySyncEmitter?.sendProgress(this.getTargetProgress(2 / 5))

    const inputs = this.getEarningInputs(earningList)

    const outdatedEarnings = Object.values(this.currentEarnings).filter(
      (e) => !inputs.find((i) => i.date === e.date)
    )
    if (outdatedEarnings.length) {
      await Earning.query(this.trx)
        .findByIds(outdatedEarnings.map((e) => e.id))
        .delete()
    }

    securitySyncEmitter?.watchTransactionProgress(
      inputs.length,
      Earning.tableName,
      targetProgress
    )

    const earnings = await Earning.query(this.trx)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
      .withGraphFetched('security')

    securitySyncEmitter?.clearWatchers()

    return earnings
  }

  getEarningInputs = (
    rawEarnings: SecurityEarningResult[]
  ): PartialModelObject<Earning>[] => {
    return rawEarnings.map((rhd) => {
      const existingEarning = this.currentEarnings[rhd.date]
      return {
        ...(existingEarning && { id: existingEarning.id }),
        ...rhd,
        securityId: this.security.id,
      }
    })
  }
}

export { EarningSyncMethod }
