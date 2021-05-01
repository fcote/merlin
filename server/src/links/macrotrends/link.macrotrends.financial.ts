import { groupBy, omit, keyBy, sumBy } from 'lodash'
import pmap from 'p-map'

import { MacroTrendsLink } from '@links/macrotrends/link.macrotrends'
import { SecurityFinancialResult } from '@links/types'
import { FinancialFreq } from '@models/financial'
import { FinancialBaseStatement, FinancialUnit } from '@models/financialItem'
import {
  FinancialStatementConfig,
  FinancialStatementMap,
} from '@typings/financial/financialStatement'

interface MacroTrendsFinancial {
  field_name: string
  popup_icon: string

  [key: string]: string | number
}

const statementMaps: FinancialStatementMap<string[]> = {
  [FinancialBaseStatement.incomeStatement]: {
    revenue: ['Revenue'],
    costOfRevenue: ['Cost Of Goods Sold'],
    grossProfit: ['Gross Profit'],
    researchAndDevelopmentExpenses: ['Research And Development Expenses'],
    generalAndAdministrativeExpenses: ['SG&A Expenses'],
    otherExpenses: ['Other Operating Income Or Expenses'],
    operatingExpenses: ['Research And Development Expenses', 'SG&A Expenses'],
    costAndExpenses: ['Operating Expenses'],
    operatingIncome: ['Operating Income'],
    nonOperatingIncome: ['Total Non-Operating Income/Expense'],
    incomeBeforeTax: ['Pre-Tax Income'],
    incomeTaxExpense: ['Income Taxes'],
    netIncome: ['Net Income'],
    interestExpense: null,
    ebit: ['EBIT'],
    depreciationAndAmortization: [
      'Total Depreciation And Amortization - Cash Flow',
    ],
    ebitda: ['EBITDA'],
    sharesOutstanding: ['Basic Shares Outstanding'],
    sharesOutstandingDiluted: ['Shares Outstanding'],
    eps: ['Basic EPS'],
    epsDiluted: ['EPS - Earnings Per Share'],
  },
  [FinancialBaseStatement.balanceSheet]: {
    cashAndCashEquivalents: ['Cash On Hand'],
    shortTermInvestments: null, // Already counted in "Cash On Hand"
    receivables: ['Receivables'],
    inventory: ['Inventory'],
    otherCurrentAssets: ['Other Current Assets'],
    totalCurrentAssets: ['Total Current Assets'],
    propertyPlantAndEquipment: ['Property, Plant, And Equipment'],
    goodwillAndIntangibleAssets: ['Goodwill And Intangible Assets'],
    longTermInvestments: ['Long-Term Investments'],
    otherNonCurrentAssets: ['Other Long-Term Assets'],
    totalNonCurrentAssets: ['Total Long-Term Assets'],
    totalAssets: ['Total Assets'],
    payables: null,
    shortTermDebt: null,
    deferredCurrentLiabilities: null,
    otherCurrentLiabilities: null,
    totalCurrentLiabilities: ['Total Current Liabilities'],
    longTermDebt: ['Long Term Debt'],
    deferredNonCurrentLiabilities: null,
    otherNonCurrentLiabilities: ['Other Non-Current Liabilities'],
    totalNonCurrentLiabilities: ['Total Long Term Liabilities'],
    totalLiabilities: ['Total Liabilities'],
    commonStock: ['Common Stock Net'],
    retainedEarnings: ['Retained Earnings (Accumulated Deficit)'],
    comprehensiveIncome: ['Comprehensive Income'],
    shareholderEquity: ['Share Holder Equity'],
  },
  [FinancialBaseStatement.cashFlowStatement]: {
    netIncome: ['Net Income/Loss'],
    depreciationAndAmortization: [
      'Total Depreciation And Amortization - Cash Flow',
    ],
    stockBasedCompensation: ['Stock-Based Compensation'],
    deferredIncomeTax: null,
    otherNonCashItems: ['Other Non-Cash Items'],
    changeInWorkingCapital: ['Total Change In Assets/Liabilities'],
    operatingCashFlow: ['Cash Flow From Operating Activities'],
    propertyPlantAndEquipmentInvestments: [
      'Net Change In Property, Plant, And Equipment',
    ],
    acquisitionsAndDisposals: ['Net Acquisitions/Divestitures'],
    investmentPurchaseAndSale: [
      'Net Change In Short-term Investments',
      'Net Change In Long-Term Investments',
    ],
    otherInvestingActivities: ['Investing Activities - Other'],
    investingCashFlow: ['Cash Flow From Investing Activities'],
    issuancePaymentsOfDebt: ['Debt Issuance/Retirement Net - Total'],
    commonStockIssuance: ['Net Common Equity Issued/Repurchased'],
    dividendsPaid: ['Total Common And Preferred Stock Dividends Paid'],
    otherFinancialActivities: ['Financial Activities - Other'],
    financingCashFlow: ['Cash Flow From Financial Activities'],
    beginningCashPosition: null,
    changesInCash: ['Net Cash Flow'],
    endCashPosition: null,
    capitalExpenditure: ['Net Change In Property, Plant, And Equipment'],
    freeCashFlow: [
      'Cash Flow From Operating Activities',
      'Net Change In Property, Plant, And Equipment',
    ],
  },
}

const defaultUnit: FinancialUnit = FinancialUnit.millions

const extractLabel = (raw: MacroTrendsFinancial): string => {
  const [nameData] = [...raw.field_name.matchAll(new RegExp('>(.*?)<', 'g'))]
  return nameData?.[1] ?? null
}

const parseMacroTrendsFinancials = (
  rawFinancials: MacroTrendsFinancial[]
): SecurityFinancialResult[] => {
  const formattedRawFinancials = groupBy(
    rawFinancials.flatMap((rf) => {
      const label = extractLabel(rf)
      const reports = omit(rf, 'field_name', 'popup_icon')

      return Object.entries(reports).map(([reportDate, value]) => ({
        reportDate,
        label,
        value: value !== '' && value !== 0 ? Number(value) : null,
      }))
    }),
    (frf) => frf.reportDate
  )
  const reportDates = Object.keys(formattedRawFinancials)

  // Statement types
  return Object.values(FinancialBaseStatement).flatMap((statement) => {
    const statementMap = statementMaps[statement]
    const statementKeys = Object.keys(statementMap)

    // Report dates
    return reportDates.flatMap((reportDate) => {
      const reportRawFinancials = keyBy(
        formattedRawFinancials[reportDate],
        (rf) => rf.label
      )

      // Statement keys
      return statementKeys.flatMap((financialSlug) => {
        const baseSecurityItem =
          FinancialStatementConfig[statement][financialSlug]
        const value = sumBy(
          statementMap[financialSlug],
          (label: string) => reportRawFinancials[label]?.value
        )

        return {
          reportDate,
          slug: financialSlug,
          statement,
          unit: defaultUnit,
          ...(value !== 0 && { value }),
          ...baseSecurityItem,
        } as SecurityFinancialResult
      })
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
    [FinancialBaseStatement.balanceSheet]: 'balance-sheet',
    [FinancialBaseStatement.cashFlowStatement]: 'cash-flow-statement',
  }
  const periodComponents = {
    [FinancialFreq.Y]: 'A',
    [FinancialFreq.Q]: 'Q',
  }

  return `/stocks/charts/${ticker}/t/${statementComponents[statement]}?freq=${periodComponents[freq]}`
}

const fetchFinancialBaseStatement = async (
  link: MacroTrendsLink,
  ticker: string,
  freq: FinancialFreq,
  statement: FinancialBaseStatement
): Promise<MacroTrendsFinancial[]> => {
  const page = await link.page(
    link.getEndpoint(baseUrl(ticker, statement, freq))
  )
  const regex = new RegExp(' var originalData = (.*?);\\r\\n\\r\\n\\r', 'g')
  const [results] = [...page.matchAll(regex)]
  return JSON.parse(results?.[1] ?? '[]') ?? ([] as MacroTrendsFinancial[])
}

async function macrotrendsFinancials(
  this: MacroTrendsLink,
  ticker: string,
  freq: FinancialFreq
): Promise<SecurityFinancialResult[]> {
  const rawFinancials = (
    await pmap(
      Object.values(FinancialBaseStatement),
      (statementType) =>
        fetchFinancialBaseStatement(this, ticker, freq, statementType),
      { concurrency: 3 }
    )
  ).flatMap((f) => f)
  return parseMacroTrendsFinancials(rawFinancials)
}

export { macrotrendsFinancials }
