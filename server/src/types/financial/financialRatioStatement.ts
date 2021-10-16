import { SecurityFinancialBaseResult } from '@links/types'
import {
  FinancialRatioStatement,
  FinancialUnit,
  FinancialItemDirection,
} from '@models/financialItem'

export type LiquidityRatioKeys =
  | 'currentRatio'
  | 'quickRatio'
  | 'cashRatio'
  | 'daysOfSalesOutstanding'
  | 'daysOfInventoryOutstanding'
  | 'daysOfPayablesOutstanding'
  | 'operatingCycle'
  | 'cashConversionCycle'

export type ProfitabilityRatioKeys =
  | 'grossProfitMargin'
  | 'operatingProfitMargin'
  | 'pretaxProfitMargin'
  | 'netProfitMargin'
  | 'effectiveTaxRate'
  | 'returnOnAssets'
  | 'returnOnEquity'
  | 'returnOnCapitalEmployed'
  | 'ebitPerRevenue'

export type DebtRatioKeys =
  | 'debtRatio'
  | 'debtToEquity'
  | 'debtToCapitalization'
  | 'cashFlowToDebt'
  | 'equityMultiplier'

export type OperatingPerformanceRatioKeys =
  | 'fixedAssetTurnover'
  | 'assetTurnover'

export type CashFlowRatioKeys =
  | 'operatingCashFlowToSales'
  | 'freeCashFlowToOperatingCashFlow'
  | 'cashFlowCoverage'
  | 'shortTermCashFlowCoverage'
  | 'capitalExpenditureCoverage'

export type ValuationRatioKeys =
  | 'priceToBookValue'
  | 'priceToCashFlow'
  | 'priceToFreeCashFlow'
  | 'priceToEarnings'
  | 'priceToSales'

export type RatioKeys =
  | LiquidityRatioKeys
  | ProfitabilityRatioKeys
  | DebtRatioKeys
  | OperatingPerformanceRatioKeys
  | CashFlowRatioKeys
  | ValuationRatioKeys

export type FinancialRatioMap<T> = {
  [FinancialRatioStatement.liquidityRatios]: Record<LiquidityRatioKeys, T>
  [FinancialRatioStatement.profitabilityRatios]: Record<
    ProfitabilityRatioKeys,
    T
  >
  [FinancialRatioStatement.debtRatios]: Record<DebtRatioKeys, T>
  [FinancialRatioStatement.operatingPerformanceRatios]: Record<
    OperatingPerformanceRatioKeys,
    T
  >
  [FinancialRatioStatement.cashFlowRatios]: Record<CashFlowRatioKeys, T>
  [FinancialRatioStatement.valuationRatios]: Record<ValuationRatioKeys, T>
}

export const FinancialRatioConfig: FinancialRatioMap<SecurityFinancialBaseResult> =
  {
    [FinancialRatioStatement.liquidityRatios]: {
      currentRatio: {
        label: 'Current ratio',
        latexDescription:
          '\\dfrac{Total Current Assets}{Total Current Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 0,
        isMain: false,
      },
      quickRatio: {
        label: 'Quick ratio',
        latexDescription:
          '\\dfrac{Cash And Equivalents + Short Term Investments + Receivables}{Total Current Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 1,
        isMain: false,
      },
      cashRatio: {
        label: 'Cash ratio',
        latexDescription:
          '\\dfrac{Cash And Equivalents}{Total Current Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 2,
        isMain: false,
      },
      daysOfSalesOutstanding: {
        label: 'Days of sales outstanding',
        latexDescription: '\\dfrac{Receivables}{Revenue/365}',
        direction: FinancialItemDirection.descending,
        index: 3,
        isMain: false,
        unit: FinancialUnit.days,
      },
      daysOfInventoryOutstanding: {
        label: 'Days of inventory outstanding',
        latexDescription: '\\dfrac{Inventory}{Cost Of Revenue/365}',
        direction: FinancialItemDirection.descending,
        index: 4,
        isMain: false,
        unit: FinancialUnit.days,
      },
      daysOfPayablesOutstanding: {
        label: 'Days of payables outstanding',
        latexDescription: '\\dfrac{Payables}{Cost Of Revenue/365}',
        direction: FinancialItemDirection.descending,
        index: 5,
        isMain: false,
        unit: FinancialUnit.days,
      },
      operatingCycle: {
        label: 'Operating cycle',
        latexDescription:
          '\\dfrac{Days Of Sales Outstanding + Days Of Inventory Outstanding}{}',
        direction: FinancialItemDirection.descending,
        index: 6,
        isMain: false,
        unit: FinancialUnit.days,
      },
      cashConversionCycle: {
        label: 'Cash conversion cycle',
        latexDescription:
          '\\dfrac{Days Of Sales Outstanding + Days Of Inventory Outstanding - Days Of Payables Outstanding}{}',
        direction: FinancialItemDirection.descending,
        index: 7,
        isMain: false,
        unit: FinancialUnit.days,
      },
    },
    [FinancialRatioStatement.profitabilityRatios]: {
      grossProfitMargin: {
        label: 'Gross profit margin',
        latexDescription: '\\dfrac{Gross Profit}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 0,
        isMain: false,
      },
      operatingProfitMargin: {
        label: 'Operating profit margin',
        latexDescription: '\\dfrac{Operating Income}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 1,
        isMain: false,
      },
      pretaxProfitMargin: {
        label: 'Pretax profit margin',
        latexDescription: '\\dfrac{Income Before Tax}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 2,
        isMain: false,
      },
      netProfitMargin: {
        label: 'Net profit margin',
        latexDescription: '\\dfrac{Net Income}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 3,
        isMain: false,
      },
      effectiveTaxRate: {
        label: 'Effective tax rate',
        latexDescription: '\\dfrac{Income Tax}{Income Before Tax}',
        direction: FinancialItemDirection.descending,
        index: 4,
        isMain: false,
      },
      returnOnAssets: {
        label: 'ROA',
        latexDescription: '\\dfrac{Net Income}{Total Assets}',
        direction: FinancialItemDirection.ascending,
        index: 5,
        isMain: false,
      },
      returnOnEquity: {
        label: 'ROE',
        latexDescription: '\\dfrac{Net Income}{Shareholder Equity}',
        direction: FinancialItemDirection.ascending,
        index: 6,
        isMain: false,
      },
      returnOnCapitalEmployed: {
        label: 'ROCE',
        latexDescription:
          '\\dfrac{EBIT}{Total Assets-Total Current Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 7,
        isMain: false,
      },
      ebitPerRevenue: {
        label: 'EBIT / Revenue',
        latexDescription: '\\dfrac{EBIT}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 8,
        isMain: false,
      },
    },
    [FinancialRatioStatement.debtRatios]: {
      debtRatio: {
        label: 'Debt ratio',
        latexDescription: '\\dfrac{Total Liabilities}{Total Assets}',
        direction: FinancialItemDirection.descending,
        index: 0,
        isMain: false,
      },
      debtToEquity: {
        label: 'Debt / Equity',
        latexDescription: '\\dfrac{Total Liabilities}{Shareholder Equity}',
        direction: FinancialItemDirection.descending,
        index: 1,
        isMain: false,
      },
      debtToCapitalization: {
        label: 'Debt / Capitalization',
        latexDescription:
          '\\dfrac{Total Liabilities}{Total Liabilities+Shareholder Equity}',
        direction: FinancialItemDirection.descending,
        index: 2,
        isMain: false,
      },
      cashFlowToDebt: {
        label: 'Cash flow / Debt',
        latexDescription: '\\dfrac{Operating Cash Flow}{Total Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 3,
        isMain: false,
      },
      equityMultiplier: {
        label: 'Equity multiplier',
        latexDescription: '\\dfrac{Total Assets}{Shareholder Equity}',
        direction: FinancialItemDirection.descending,
        index: 4,
        isMain: false,
      },
    },
    [FinancialRatioStatement.operatingPerformanceRatios]: {
      fixedAssetTurnover: {
        label: 'Fixed asset turnover',
        latexDescription: '\\dfrac{Revenue}{Property Plant And Equipment}',
        direction: FinancialItemDirection.ascending,
        index: 0,
        isMain: false,
      },
      assetTurnover: {
        label: 'Asset turnover',
        latexDescription: '\\dfrac{Revenue}{Total Assets}',
        direction: FinancialItemDirection.ascending,
        index: 1,
        isMain: false,
      },
    },
    [FinancialRatioStatement.cashFlowRatios]: {
      operatingCashFlowToSales: {
        label: 'Operating cash flow / Sales',
        latexDescription: '\\dfrac{Operating Cash Flow}{Revenue}',
        direction: FinancialItemDirection.ascending,
        index: 0,
        isMain: false,
      },
      freeCashFlowToOperatingCashFlow: {
        label: 'Free cash flow / Operating cash flow',
        latexDescription: '\\dfrac{Free Cash Flow}{Operating Cash Flow}',
        direction: FinancialItemDirection.ascending,
        index: 1,
        isMain: false,
      },
      cashFlowCoverage: {
        label: 'Cash flow coverage',
        latexDescription: '\\dfrac{Operating Cash Flow}{Total Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 2,
        isMain: false,
      },
      shortTermCashFlowCoverage: {
        label: 'Short-term cash flow coverage',
        latexDescription:
          '\\dfrac{Operating Cash Flow}{Total Current Liabilities}',
        direction: FinancialItemDirection.ascending,
        index: 3,
        isMain: false,
      },
      capitalExpenditureCoverage: {
        label: 'Capital expenditure coverage',
        latexDescription: '\\dfrac{Operating Cash Flow}{Capital Expenditure}',
        direction: FinancialItemDirection.ascending,
        index: 4,
        isMain: false,
      },
    },
    [FinancialRatioStatement.valuationRatios]: {
      priceToBookValue: {
        label: 'Price to book value',
        latexDescription: '\\dfrac{StockPrice}{EquityPerShare}',
        direction: FinancialItemDirection.descending,
        index: 0,
        isMain: false,
      },
      priceToCashFlow: {
        label: 'Price to cash flow',
        latexDescription: '\\dfrac{StockPrice}{OperatingCashFlowPerShare}',
        direction: FinancialItemDirection.descending,
        index: 1,
        isMain: false,
      },
      priceToFreeCashFlow: {
        label: 'Price to free cash flow',
        latexDescription: '\\dfrac{StockPrice}{FreeCashFlowPerShare}',
        direction: FinancialItemDirection.descending,
        index: 1,
        isMain: false,
      },
      priceToEarnings: {
        label: 'Price to earnings',
        latexDescription: '\\dfrac{StockPrice}{EPS}',
        direction: FinancialItemDirection.descending,
        index: 2,
        isMain: false,
      },
      priceToSales: {
        label: 'Price to sales',
        latexDescription: '\\dfrac{StockPrice}{RevenuePerShare}',
        direction: FinancialItemDirection.descending,
        index: 3,
        isMain: false,
      },
    },
  }
