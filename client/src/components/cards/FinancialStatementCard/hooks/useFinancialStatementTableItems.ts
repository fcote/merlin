import { Key, useMemo } from 'react'

import { formatBigValue } from '@helpers/formatBigValue'

import { Financial, FinancialPerformance } from '@lib/financial'
import {
  FinancialItem,
  FinancialItemDirection,
  FinancialItemType,
} from '@lib/financialItem'

export type FinancialStatementTableItemValue = {
  value: string
  growth: number
  performance: FinancialPerformance
}

export type FinancialStatementTableItem = Record<
  string,
  FinancialStatementTableItemValue
> & {
  key: Key
  itemName: string
  isMain: boolean
  direction?: FinancialItemDirection
  latexDescription?: string
}

const computeGrowth = (fi: FinancialItem, f: Financial, index: number) => {
  if (fi.type !== FinancialItemType.statement) return
  const previousValue = fi.financials[index + 1]?.value
  return previousValue && (f.value - previousValue) / Math.abs(previousValue)
}

const computeValue = (fi: FinancialItem, f: Financial) => {
  return fi.type === FinancialItemType.statement
    ? formatBigValue(f.value, fi.unitType, fi.unit)
    : f.value?.toFixed(2)
}

const useFinancialStatementTableItems = (financialItems: FinancialItem[]) => {
  return useMemo(() => {
    return financialItems.reduce((formatted, fi) => {
      const itemFinancials = fi.financials.reduce((result, f, index) => {
        const date = `${f.year}-${f.period}`
        result[date] = {
          value: computeValue(fi, f),
          growth: computeGrowth(fi, f, index),
          performance: f.performance,
        }
        return result
      }, {} as Record<string, FinancialStatementTableItemValue>)

      formatted.push({
        key: fi.id,
        itemName: fi.label,
        isMain: fi.isMain,
        direction: fi.direction,
        latexDescription: fi.latexDescription,
        ...itemFinancials,
      } as FinancialStatementTableItem)

      return formatted
    }, [] as FinancialStatementTableItem[])
  }, [financialItems])
}

export default useFinancialStatementTableItems
