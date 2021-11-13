import { keyBy } from 'lodash'
import { PartialModelObject } from 'objection'

import { historicalPricesLink } from '@links/links'
import { SecurityHistoricalPriceResult } from '@links/types'
import { HistoricalPrice } from '@models/historicalPrice'
import { Security } from '@models/security'
import { SecuritySyncEmitter } from '@services/security/sync'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'
import { DefaultErrorCodes } from '@typings/errors/errorCodes'

class HistoricalPriceSyncMethod extends ServiceMethod {
  private security: Security
  private currentHistoricalPrices: Record<string, Partial<HistoricalPrice>>
  private securitySyncEmitter?: SecuritySyncEmitter
  private startProgress: number = 0
  private targetProgress: number = 0
  private nSynced: number = 0

  private setCurrentHistoricalPrices = async () => {
    const historicalPrices = await HistoricalPrice.query(this.trx)
      .select('id', 'date', 'open', 'high', 'low', 'close', 'volume')
      .where('securityId', this.security.id)
    this.currentHistoricalPrices = keyBy(historicalPrices, (hp) => hp.date)
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
      .select('id')
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

    await this.setCurrentHistoricalPrices()
    securitySyncEmitter?.sendProgress(this.getTargetProgress(1 / 10))

    const historicalPrices = await historicalPricesLink.historicalPrices(ticker)
    securitySyncEmitter?.sendProgress(this.getTargetProgress(2 / 10))

    const inputs = this.getHistoricalPriceInputs(historicalPrices)

    securitySyncEmitter?.watchTransactionProgress(
      inputs.length,
      HistoricalPrice.tableName,
      targetProgress
    )

    if (inputs.length) {
      await HistoricalPrice.query(this.trx)
        .insert(inputs)
        .onConflict('id')
        .merge()
    }

    this.nSynced += inputs.length
    securitySyncEmitter?.clearWatchers()

    return this.nSynced
  }

  getHistoricalPriceInputs = (
    rawHistoricalPrices: SecurityHistoricalPriceResult[]
  ): PartialModelObject<HistoricalPrice>[] => {
    return rawHistoricalPrices
      .map((rhp) => {
        const existingHistoricalPrice = this.currentHistoricalPrices[rhp.date]
        return HistoricalPrice.format(
          rhp,
          this.security,
          existingHistoricalPrice
        )
      })
      .filter((hp) => hp) as PartialModelObject<HistoricalPrice>[]
  }
}

export { HistoricalPriceSyncMethod }
