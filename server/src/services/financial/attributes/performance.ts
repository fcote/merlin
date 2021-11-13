import { uniq } from 'lodash'

import { Financial, FinancialPerformanceGrade } from '@models/financial'
import {
  FinancialItem,
  FinancialItemType,
  FinancialItemDirection,
} from '@models/financialItem'
import { Security } from '@models/security'
import { ServiceMethod } from '@services/service'

const financialGradeRanges: Record<
  FinancialPerformanceGrade,
  { min: number; max: number }
> = {
  [FinancialPerformanceGrade.aPlus]: {
    min: 0.75,
    max: Number.MAX_SAFE_INTEGER,
  },
  [FinancialPerformanceGrade.a]: { min: 0.5, max: 0.75 },
  [FinancialPerformanceGrade.aMinus]: { min: 0.25, max: 0.5 },
  [FinancialPerformanceGrade.bPlus]: { min: 0.1, max: 0.25 },
  [FinancialPerformanceGrade.b]: { min: -0.1, max: 0.1 },
  [FinancialPerformanceGrade.bMinus]: { min: -0.25, max: -0.1 },
  [FinancialPerformanceGrade.cPlus]: { min: -0.5, max: -0.25 },
  [FinancialPerformanceGrade.c]: { min: -0.75, max: -0.5 },
  [FinancialPerformanceGrade.cMinus]: {
    min: Number.MIN_SAFE_INTEGER,
    max: -0.75,
  },
}

class FinancialPerformanceMethod extends ServiceMethod {
  run = async (financialIds: readonly (number | string)[]) => {
    const financials = await Financial.query(this.trx)
      .joinRelated('financialItem')
      .where('financialItem.type', FinancialItemType.ratio)
      .findByIds(financialIds as (number | string)[])
    if (!financials.length) {
      return financialIds.map(() => undefined)
    }

    const financialRatioItems = await FinancialItem.query(this.trx).where({
      type: FinancialItemType.ratio,
    })
    const securities = await Security.query(this.trx)
      .findByIds(uniq(financials.map((f) => f.securityId)))
      .withGraphFetched('company')
    const sectorRatios = await Financial.query(this.trx)
      .whereIn('year', uniq(financials.map((f) => f.year)))
      .whereIn('period', uniq(financials.map((f) => f.period)))
      .whereIn('sectorId', uniq(securities.map((s) => s.company.sectorId)))
      .whereIn(
        'financialItemId',
        uniq(financials.map((f) => f.financialItemId))
      )

    return financialIds.map((financialId) => {
      const financialRatio = financials.find(
        (f) => f.id.toString() === financialId.toString()
      )
      const financialItem = financialRatioItems.find(
        (fi) => fi.id === financialRatio?.financialItemId
      )
      const security = securities.find(
        (s) => s.id === financialRatio?.securityId
      )
      const sectorRatio = sectorRatios.find(
        (sr) =>
          sr.financialItemId === financialRatio?.financialItemId &&
          sr.year === financialRatio?.year &&
          sr.period === financialRatio?.period &&
          sr.sectorId === security?.company?.sectorId
      )
      if (!sectorRatio?.value || !financialRatio?.value || !financialItem) {
        return
      }

      const diffPercent = this.getDiffPercent(financialRatio, sectorRatio)
      let grade = this.getGrade(diffPercent, financialItem.direction!)

      // Handle descending ratio negative value edge case
      if (
        financialItem.direction === FinancialItemDirection.descending &&
        sectorRatio.value >= 0 &&
        financialRatio.value < 0
      ) {
        grade = FinancialPerformanceGrade.cMinus
      }

      return {
        sectorValue: sectorRatio.value,
        grade,
        diffPercent,
      }
    })
  }

  private getDiffPercent = (
    financial: Financial,
    sectorRatio: Financial
  ): number | null => {
    if (!financial.value || !sectorRatio.value) return null
    return (financial.value - sectorRatio.value) / Math.abs(sectorRatio.value)
  }

  private getGrade = (
    diffPercent: number | null,
    direction: FinancialItemDirection
  ) => {
    if (!diffPercent) return null
    if (direction === FinancialItemDirection.descending) {
      diffPercent = -diffPercent
    }
    return Object.values(FinancialPerformanceGrade).find((grade) => {
      const range = financialGradeRanges[grade]
      return diffPercent! >= range.min && diffPercent! <= range.max
    }) as FinancialPerformanceGrade
  }
}

export { FinancialPerformanceMethod }
