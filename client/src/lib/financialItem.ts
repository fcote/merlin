import { Financial } from '@lib/financial'

export enum FinancialUnit {
  millions = 'millions',
  unit = 'unit',
  percent = 'percent',
  days = 'days',
}

export enum FinancialUnitType {
  ratio = 'ratio',
  amount = 'amount',
  currency = 'currency',
}

const unitToValue = {
  [FinancialUnit.millions]: 1e6,
  [FinancialUnit.unit]: 1,
  [FinancialUnit.percent]: 1,
  [FinancialUnit.days]: 1,
}

export const valueForFinancialUnit = (unit: FinancialUnit): number => {
  return unitToValue[unit]
}

export enum FinancialRatioStatement {
  liquidityRatios = 'liquidityRatios',
  profitabilityRatios = 'profitabilityRatios',
  debtRatios = 'debtRatios',
  cashFlowRatios = 'cashFlowRatios',
  valuationRatios = 'valuationRatios',
  operatingPerformanceRatios = 'operatingPerformanceRatios',
}

export enum FinancialBaseStatement {
  incomeStatement = 'incomeStatement',
  balanceSheet = 'balanceSheet',
  cashFlowStatement = 'cashFlowStatement',
}

export type FinancialStatement =
  | FinancialRatioStatement
  | FinancialBaseStatement

export const financialStatementLabel = {
  [FinancialBaseStatement.incomeStatement]: 'Income Statement',
  [FinancialBaseStatement.balanceSheet]: 'Balance Sheet',
  [FinancialBaseStatement.cashFlowStatement]: 'Cash Flow Statement',
  [FinancialRatioStatement.liquidityRatios]: 'Liquidity',
  [FinancialRatioStatement.profitabilityRatios]: 'Profitability',
  [FinancialRatioStatement.debtRatios]: 'Debt',
  [FinancialRatioStatement.cashFlowRatios]: 'Cash flow',
  [FinancialRatioStatement.valuationRatios]: 'Valuation',
  [FinancialRatioStatement.operatingPerformanceRatios]: 'Operating performance',
}

export enum FinancialItemType {
  statement = 'statement',
  ratio = 'ratio',
}

export const numberOfItemsForStatement = {
  [FinancialBaseStatement.incomeStatement]: 21,
  [FinancialBaseStatement.balanceSheet]: 26,
  [FinancialBaseStatement.cashFlowStatement]: 22,
  [FinancialRatioStatement.liquidityRatios]: 8,
  [FinancialRatioStatement.profitabilityRatios]: 9,
  [FinancialRatioStatement.debtRatios]: 5,
  [FinancialRatioStatement.cashFlowRatios]: 5,
  [FinancialRatioStatement.valuationRatios]: 5,
  [FinancialRatioStatement.operatingPerformanceRatios]: 2,
}

export enum FinancialItemDirection {
  ascending = 'ascending',
  descending = 'descending',
}

export type FinancialItem = {
  id: string
  slug: string
  label: string
  type: FinancialItemType
  statement: FinancialStatement
  index: number
  unit: FinancialUnit
  unitType: FinancialUnitType
  isMain: boolean
  latexDescription: string
  direction?: FinancialItemDirection

  financials: Financial[]
}
