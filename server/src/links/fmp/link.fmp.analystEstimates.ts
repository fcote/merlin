import { dayjs } from '@helpers/dayjs'
import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityFinancialResult } from '@links/types'
import { FinancialFreq, FinancialPeriod } from '@models/financial'
import { FinancialBaseStatement, FinancialUnit } from '@models/financialItem'
import {
  IncomeStatementKeys,
  FinancialStatementConfig,
} from '@typings/financial/financialStatement'

export interface FMPAnalystEstimates {
  symbol: string
  date: string
  estimatedRevenueLow: number
  estimatedRevenueHigh: number
  estimatedRevenueAvg: number
  estimatedEbitdaLow: number
  estimatedEbitdaHigh: number
  estimatedEbitdaAvg: number
  estimatedEbitLow: number
  estimatedEbitHigh: number
  estimatedEbitAvg: number
  estimatedNetIncomeLow: number
  estimatedNetIncomeHigh: number
  estimatedNetIncomeAvg: number
  estimatedSgaExpenseLow: number
  estimatedSgaExpenseHigh: number
  estimatedSgaExpenseAvg: number
  estimatedEpsAvg: number
  estimatedEpsHigh: number
  estimatedEpsLow: number
  numberAnalystEstimatedRevenue: number
  numberAnalystsEstimatedEps: number
}

const statementMap: Record<string, IncomeStatementKeys> = {
  estimatedRevenueAvg: 'revenue',
  estimatedEbitdaAvg: 'ebitda',
  estimatedEbitAvg: 'ebit',
  estimatedNetIncomeAvg: 'netIncome',
  estimatedSgaExpenseAvg: 'generalAndAdministrativeExpenses',
  estimatedEpsAvg: 'eps',
}

const defaultUnit: FinancialUnit = FinancialUnit.millions

const toSecurityFinancialResult = (
  item: FMPAnalystEstimates,
  freq: FinancialFreq
): SecurityFinancialResult[] => {
  const reportDate = dayjs(item.date)
  return Object.keys(item)
    .filter((k) => statementMap[k])
    .map((k) => {
      const financialSlug = statementMap[k]
      const baseSecurityItem =
        FinancialStatementConfig[FinancialBaseStatement.incomeStatement][
          financialSlug
        ]
      const period =
        freq === FinancialFreq.Y
          ? FinancialPeriod.Y
          : (`Q${reportDate.quarter()}` as FinancialPeriod)

      const result = {
        slug: financialSlug,
        statement: FinancialBaseStatement.incomeStatement,
        reportDate: item.date,
        unit: defaultUnit,
        isEstimate: true,
        value: item[k],
        period,
        ...baseSecurityItem,
      }

      if (result.unit === FinancialUnit.millions) {
        result.value /= 1e6
      }

      return result
    })
}

async function fmpAnalystEstimates(
  this: FMPLink,
  ticker: string,
  freq: FinancialFreq
): Promise<SecurityFinancialResult[]> {
  const periodComponents = {
    [FinancialFreq.Y]: 'year',
    [FinancialFreq.Q]: 'quarter',
  }
  const response = await this.query<FMPAnalystEstimates[]>(
    this.getEndpoint(`/v3/analyst-estimates/${ticker}`, {
      period: periodComponents[freq],
    })
  )
  return response?.flatMap((item) => toSecurityFinancialResult(item, freq))
}

export { fmpAnalystEstimates }
