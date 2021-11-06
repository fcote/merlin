import { uniqBy, groupBy, mean } from 'lodash'

import { dayjs } from '@helpers/dayjs'
import { fiscalPeriodFromDate } from '@helpers/fiscalPeriodFromDate'
import { financialsLink, analystEstimatesLink } from '@links/links'
import { SecurityFinancialResult } from '@links/types'
import { logger } from '@logger'
import { Financial, FinancialFreq, FinancialPeriod } from '@models/financial'
import {
  FinancialItem,
  FinancialItemType,
  FinancialBaseStatement,
} from '@models/financialItem'
import { HistoricalPrice } from '@models/historicalPrice'
import { Security } from '@models/security'
import { FinancialSyncSecurityFields } from '@resolvers/financial/financial.inputs'
import { FinancialService } from '@services/financial/index'
import { FinancialRatioProcessor } from '@services/financial/processors/ratio'
import { FinancialTTMProcessor } from '@services/financial/processors/ttm'
import { SecuritySyncEmitter } from '@services/security/sync'
import { ServiceMethod } from '@services/service'

class FinancialSyncSecurityMethod extends ServiceMethod {
  protected service: FinancialService

  private security: Security
  private currentFinancials: Financial[]
  private currentFinancialItems: FinancialItem[]
  private currentHistoricalPrices: HistoricalPrice[]
  private fiscalYearEndMonth: number
  private securitySyncEmitter?: SecuritySyncEmitter
  private startProgress?: number
  private targetProgress?: number
  private nSynced: number = 0

  private setCurrentFinancials = async (freq: FinancialFreq) => {
    const periodFilter =
      freq === FinancialFreq.Q
        ? [
            FinancialPeriod.Q1,
            FinancialPeriod.Q2,
            FinancialPeriod.Q3,
            FinancialPeriod.Q4,
          ]
        : [freq]
    this.currentFinancials = await Financial.query(this.trx)
      .where('financials.securityId', this.security.id)
      .whereIn('financials.period', periodFilter)
      .withGraphFetched('financialItem')
    this.currentFinancialItems = await FinancialItem.query(this.trx)
  }

  private setCurrentHistoricalPrices = async () => {
    this.currentHistoricalPrices = await HistoricalPrice.query(this.trx)
      .select('id', 'date', 'close')
      .where('securityId', this.security.id)
      .orderBy('date', 'desc')
  }

  private getAveragePrice = (freq: FinancialFreq, reportDate: string) => {
    if (freq === FinancialFreq.TTM) {
      return this.currentHistoricalPrices.slice(0, 2).shift()?.close
    }
    const startIndex = this.currentHistoricalPrices.findIndex(
      (hp) => hp.date <= reportDate
    )
    const prices = this.currentHistoricalPrices
      .slice(startIndex, startIndex + 30)
      .map((hp) => hp.close)
    return mean(prices)
  }

  private getTargetProgress = (factor: number) => {
    const progressLeft = this.targetProgress - this.startProgress
    return this.startProgress + progressLeft * factor
  }

  run = async (
    inputs: FinancialSyncSecurityFields,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress: number = 1
  ) => {
    this.securitySyncEmitter = securitySyncEmitter
    this.startProgress = this.securitySyncEmitter?.currentProgress ?? 0
    this.targetProgress = targetProgress
    this.security = await Security.query(this.trx).findOne(
      'ticker',
      inputs.ticker
    )

    this.securitySyncEmitter?.sendProgress(this.getTargetProgress(1 / 10))

    // Retrieve historical prices to compute ratios
    await this.setCurrentHistoricalPrices()

    // Retrieve raw updated financials
    const [
      yearRawFinancials,
      quarterRawFinancials,
      yearRawEstimates,
      quarterRawEstimates,
    ] = await Promise.all([
      financialsLink.financials(this.security.ticker, FinancialFreq.Y),
      financialsLink.financials(this.security.ticker, FinancialFreq.Q),
      analystEstimatesLink?.analystEstimates?.(
        this.security.ticker,
        FinancialFreq.Y
      ),
      analystEstimatesLink?.analystEstimates?.(
        this.security.ticker,
        FinancialFreq.Q
      ),
    ])

    this.securitySyncEmitter?.sendProgress(this.getTargetProgress(2 / 10))

    if (!yearRawFinancials?.length) {
      logger.info(`financials > sync > missing financials`, {
        ticker: inputs.ticker,
      })
      this.securitySyncEmitter?.sendProgress(targetProgress)
      return
    }

    // Compute the fiscal quarter offset of the company
    this.fiscalYearEndMonth =
      dayjs(yearRawFinancials.slice(0, 1).shift().reportDate).month() + 1

    // Upsert reported yearly financials
    await this.upsertFinancials(
      yearRawFinancials,
      FinancialFreq.Y,
      this.getTargetProgress(3 / 10)
    )
    // Upsert computed yearly ratios
    await this.upsertFinancialRatios(
      FinancialFreq.Y,
      this.getTargetProgress(4 / 10)
    )
    // Upsert reported quarters financials
    await this.upsertFinancials(
      quarterRawFinancials,
      FinancialFreq.Q,
      this.getTargetProgress(5 / 10)
    )
    // Upsert computed quarters ratios
    await this.upsertFinancialRatios(
      FinancialFreq.Q,
      this.getTargetProgress(6 / 10)
    )
    // Upsert ttm financials
    await this.upsertFinancialTTM(this.getTargetProgress(7 / 10))
    // Upsert ttm ratios
    await this.upsertFinancialRatios(
      FinancialFreq.TTM,
      this.getTargetProgress(8 / 10)
    )
    // Upsert reported yearly estimates
    await this.upsertFinancials(
      yearRawEstimates,
      FinancialFreq.Y,
      this.getTargetProgress(9 / 10)
    )
    // Upsert reported quarterly estimates
    await this.upsertFinancials(
      quarterRawEstimates,
      FinancialFreq.Q,
      this.getTargetProgress(10 / 10)
    )

    // Set fiscal year end month
    await this.security
      .$query(this.trx)
      .patch({ fiscalYearEndMonth: this.fiscalYearEndMonth })

    return this.nSynced
  }

  private upsertFinancialRatios = async (
    freq: FinancialFreq,
    targetProgress: number
  ) => {
    await this.setCurrentFinancials(freq)
    const rawRatioFinancials = this.getRatios(freq)
    await this.upsertFinancials(rawRatioFinancials, freq, targetProgress)
    this.securitySyncEmitter?.sendProgress(targetProgress)
  }

  private upsertFinancialTTM = async (targetProgress: number) => {
    const rawTTMFinancials = this.getTTM()
    await this.upsertFinancials(
      rawTTMFinancials,
      FinancialFreq.TTM,
      targetProgress
    )
    this.securitySyncEmitter?.sendProgress(targetProgress)
  }

  private upsertFinancials = async (
    rawFinancials: SecurityFinancialResult[],
    freq: FinancialFreq,
    targetProgress: number
  ) => {
    if (!rawFinancials) {
      this.securitySyncEmitter?.clearWatchers()
      this.securitySyncEmitter?.sendProgress(targetProgress)
      return
    }

    await this.setCurrentFinancials(freq)
    // Insert financial items
    const itemInputs = this.getFinancialItems(rawFinancials)
    if (itemInputs.length) {
      await FinancialItem.query(this.trx).upsertGraph(itemInputs)
      this.currentFinancialItems = await FinancialItem.query(this.trx)
    }

    // Upsert financials
    const inputs = await this.getFinancials(rawFinancials, freq)
    this.securitySyncEmitter?.watchTransactionProgress(
      inputs.length,
      Financial.tableName,
      targetProgress
    )

    if (inputs.length) {
      await Financial.query(this.trx).insert(inputs).onConflict('id').merge()
    }

    this.nSynced += inputs.length
    this.securitySyncEmitter?.clearWatchers()
    this.securitySyncEmitter?.sendProgress(targetProgress)
  }

  private getFinancialItems = (rawFinancials: SecurityFinancialResult[]) => {
    const formattedFinancialItems = rawFinancials
      .map((rf) => {
        const existingFinancialItem = this.currentFinancialItems.find(
          (f) => f.slug === rf.slug && f.statement === rf.statement
        )
        const type = Object.values(FinancialBaseStatement).includes(
          rf.statement as FinancialBaseStatement
        )
          ? FinancialItemType.statement
          : FinancialItemType.ratio
        return FinancialItem.format(rf, type, existingFinancialItem)
      })
      .filter((f) => f)

    return uniqBy(formattedFinancialItems, (f) => `${f.slug}-${f.statement}`)
  }

  private getFinancials = async (
    rawFinancials: SecurityFinancialResult[],
    freq: FinancialFreq
  ) => {
    const formattedFinancials = rawFinancials
      .map((rf) => {
        const { fiscalYear: rfYear, fiscalQuarter } = fiscalPeriodFromDate(
          rf.reportDate,
          this.fiscalYearEndMonth
        )
        const rfPeriod = freq === FinancialFreq.Q ? `Q${fiscalQuarter}` : freq
        const existingFinancialItem = this.currentFinancialItems.find(
          (f) => f.slug === rf.slug && f.statement === rf.statement
        )
        const existingFinancial = this.currentFinancials.find(
          (f) =>
            f.year === rfYear &&
            f.period === rfPeriod &&
            f.financialItemId === existingFinancialItem.id
        )
        return Financial.format(
          rf,
          rfYear,
          rfPeriod,
          this.security,
          existingFinancial,
          existingFinancialItem
        )
      })
      .filter((f) => f)

    return uniqBy(
      formattedFinancials,
      (f) => `${f.financialItemId}-${f.year}-${f.period}`
    )
  }

  private getRatios = (freq: FinancialFreq) => {
    return Object.values(
      groupBy(
        this.currentFinancials.filter((cf) => !cf.isEstimate),
        (f) => `${f.year}-${f.period}`
      )
    ).flatMap((reportFinancials) => {
      const [{ reportDate }] = reportFinancials
      const price = this.getAveragePrice(freq, reportDate)
      return new FinancialRatioProcessor(
        reportDate,
        price,
        reportFinancials,
        freq
      ).ratios()
    })
  }

  private getTTM = () => {
    const groupedFinancials = groupBy(
      this.currentFinancials.filter((cf) => !cf.isEstimate),
      (f) => `${f.year}-${f.period}`
    )
    const last4Quarters = Object.keys(groupedFinancials)
      .sort()
      .reverse()
      .slice(0, 4)
    const ttmFinancials = last4Quarters.flatMap((reportDate) =>
      uniqBy(groupedFinancials[reportDate], (f) => f.financialItem.slug)
    )
    return new FinancialTTMProcessor(ttmFinancials).ttm()
  }
}

export { FinancialSyncSecurityMethod }
