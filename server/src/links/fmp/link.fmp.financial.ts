import { keyBy, sumBy } from 'lodash'
import pmap from 'p-map'

import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityFinancialResult } from '@links/types'
import { FinancialFreq, FinancialPeriod } from '@models/financial'
import { FinancialBaseStatement, FinancialUnit } from '@models/financialItem'
import {
  FinancialStatementConfig,
  FinancialStatementMap,
} from '@typings/financial/financialStatement'

type FMPFinancial = Record<string, number> & {
  date: string
  period: string
}

const statementMaps: FinancialStatementMap<string[]> = {
  [FinancialBaseStatement.incomeStatement]: {
    revenue: ['revenue'],
    costOfRevenue: ['costOfRevenue'],
    grossProfit: ['grossProfit'],
    researchAndDevelopmentExpenses: ['researchAndDevelopmentExpenses'],
    generalAndAdministrativeExpenses: ['generalAndAdministrativeExpenses'],
    otherExpenses: ['otherExpenses'],
    operatingExpenses: ['operatingExpenses'],
    costAndExpenses: ['costAndExpenses'],
    operatingIncome: ['operatingIncome'],
    nonOperatingIncome: ['totalOtherIncomeExpensesNet'],
    incomeBeforeTax: ['incomeBeforeTax'],
    incomeTaxExpense: ['incomeTaxExpense'],
    netIncome: ['netIncome'],
    interestExpense: ['interestExpense'],
    ebit: ['netIncome', 'interestExpense', 'incomeTaxExpense'],
    depreciationAndAmortization: ['depreciationAndAmortization'],
    ebitda: ['ebitda'],
    sharesOutstanding: ['weightedAverageShsOut'],
    sharesOutstandingDiluted: ['weightedAverageShsOutDil'],
    eps: ['eps'],
    epsDiluted: ['epsdiluted'],
  },
  [FinancialBaseStatement.balanceSheet]: {
    cashAndCashEquivalents: ['cashAndCashEquivalents'],
    shortTermInvestments: ['shortTermInvestments'],
    receivables: ['netReceivables'],
    inventory: ['inventory'],
    otherCurrentAssets: ['otherCurrentAssets'],
    totalCurrentAssets: ['totalCurrentAssets'],
    propertyPlantAndEquipment: ['propertyPlantEquipmentNet'],
    goodwillAndIntangibleAssets: ['goodwillAndIntangibleAssets'],
    longTermInvestments: ['longTermInvestments'],
    otherNonCurrentAssets: ['otherNonCurrentAssets'],
    totalNonCurrentAssets: ['totalNonCurrentAssets'],
    totalAssets: ['totalAssets'],
    payables: ['accountPayables'],
    shortTermDebt: ['shortTermDebt'],
    deferredCurrentLiabilities: ['deferredRevenue'],
    otherCurrentLiabilities: ['otherCurrentLiabilities'],
    totalCurrentLiabilities: ['totalCurrentLiabilities'],
    longTermDebt: ['longTermDebt'],
    deferredNonCurrentLiabilities: [
      'deferredRevenueNonCurrent',
      'deferredTaxLiabilitiesNonCurrent',
    ],
    otherNonCurrentLiabilities: ['otherNonCurrentLiabilities'],
    totalNonCurrentLiabilities: ['totalNonCurrentLiabilities'],
    totalLiabilities: ['totalLiabilities'],
    commonStock: ['commonStock'],
    retainedEarnings: ['retainedEarnings'],
    comprehensiveIncome: ['accumulatedOtherComprehensiveIncomeLoss'],
    shareholderEquity: ['totalStockholdersEquity'],
  },
  [FinancialBaseStatement.cashFlowStatement]: {
    netIncome: ['netIncome'],
    depreciationAndAmortization: ['depreciationAndAmortization'],
    stockBasedCompensation: ['stockBasedCompensation'],
    deferredIncomeTax: ['deferredIncomeTax'],
    otherNonCashItems: ['otherNonCashItems'],
    changeInWorkingCapital: ['changeInWorkingCapital'],
    operatingCashFlow: ['netCashProvidedByOperatingActivities'],
    propertyPlantAndEquipmentInvestments: [
      'investmentsInPropertyPlantAndEquipment',
    ],
    acquisitionsAndDisposals: ['acquisitionsNet'],
    investmentPurchaseAndSale: [
      'purchasesOfInvestments',
      'salesMaturitiesOfInvestments',
    ],
    otherInvestingActivities: ['otherInvestingActivites'],
    investingCashFlow: ['netCashUsedForInvestingActivites'],
    issuancePaymentsOfDebt: null,
    commonStockIssuance: ['commonStockIssued', 'commonStockRepurchased'],
    dividendsPaid: ['dividendsPaid'],
    otherFinancialActivities: ['otherFinancingActivites'],
    financingCashFlow: ['netCashUsedProvidedByFinancingActivities'],
    beginningCashPosition: ['cashAtBeginningOfPeriod'],
    changesInCash: ['netChangeInCash'],
    endCashPosition: ['cashAtEndOfPeriod'],
    capitalExpenditure: ['capitalExpenditure'],
    freeCashFlow: ['freeCashFlow'],
  },
}

const defaultUnit: FinancialUnit = FinancialUnit.millions

const formatPeriod = (period: string) => {
  if (!period) return
  if (period.includes('Q')) return period as FinancialPeriod
  return FinancialPeriod.Y
}

const parseFMPFinancials = (
  rawFinancials: FMPFinancial[],
  statement: FinancialBaseStatement
): SecurityFinancialResult[] => {
  const formattedRawFinancials = keyBy(rawFinancials, (frf) => frf.date)
  const reportDates = Object.keys(formattedRawFinancials)

  const statementMap = statementMaps[statement]
  const statementKeys = Object.keys(statementMap)

  // Report dates
  return reportDates.flatMap((reportDate) => {
    const reportRawFinancials = formattedRawFinancials[reportDate]

    return statementKeys.flatMap((financialSlug) => {
      const baseSecurityItem =
        FinancialStatementConfig[statement][financialSlug]
      const value = sumBy(
        statementMap[financialSlug],
        (slug: string) => reportRawFinancials[slug]
      )

      const res = {
        reportDate,
        statement,
        slug: financialSlug,
        value: value || null,
        unit: defaultUnit,
        period: formatPeriod(reportRawFinancials.period),
        ...baseSecurityItem,
      } as SecurityFinancialResult

      if (res.unit === FinancialUnit.millions) {
        res.value /= 1e6
      }

      return res
    })
  })
}

const baseUrl = (
  ticker: string,
  statement: FinancialBaseStatement,
  freq: FinancialFreq
) => {
  const statementComponents = {
    [FinancialBaseStatement.incomeStatement]: 'income-statement',
    [FinancialBaseStatement.balanceSheet]: 'balance-sheet-statement',
    [FinancialBaseStatement.cashFlowStatement]: 'cash-flow-statement',
  }
  const periodComponents = {
    [FinancialFreq.Y]: 'year',
    [FinancialFreq.Q]: 'quarter',
  }

  return `/v3/${statementComponents[statement]}/${ticker}?period=${periodComponents[freq]}`
}

const fetchFinancialBaseStatement = async (
  link: FMPLink,
  ticker: string,
  freq: FinancialFreq,
  statement: FinancialBaseStatement
): Promise<FMPFinancial[]> => {
  return link.query<FMPFinancial[]>(
    link.getEndpoint(baseUrl(ticker, statement, freq))
  )
}

async function fmpFinancials(
  this: FMPLink,
  ticker: string,
  freq: FinancialFreq
): Promise<SecurityFinancialResult[]> {
  const financials = await pmap(
    Object.values(FinancialBaseStatement),
    async (statementType) => {
      const rawFinancials = await fetchFinancialBaseStatement(
        this,
        ticker,
        freq,
        statementType
      )
      return parseFMPFinancials(rawFinancials, statementType)
    },
    { concurrency: 1 }
  )
  return financials.flat()
}

export { fmpFinancials }
