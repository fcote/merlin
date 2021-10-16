import { SecurityFinancialBaseResult } from '@links/types'
import {
  FinancialBaseStatement,
  FinancialUnitType,
  FinancialUnit,
} from '@models/financialItem'

export type IncomeStatementKeys =
  | 'revenue'
  | 'costOfRevenue'
  | 'grossProfit'
  | 'researchAndDevelopmentExpenses'
  | 'generalAndAdministrativeExpenses'
  | 'otherExpenses'
  | 'operatingExpenses'
  | 'costAndExpenses'
  | 'operatingIncome'
  | 'nonOperatingIncome'
  | 'incomeBeforeTax'
  | 'incomeTaxExpense'
  | 'netIncome'
  | 'interestExpense'
  | 'ebit'
  | 'depreciationAndAmortization'
  | 'ebitda'
  | 'sharesOutstanding'
  | 'sharesOutstandingDiluted'
  | 'eps'
  | 'epsDiluted'

export type BalanceSheetStatementKeys =
  | 'cashAndCashEquivalents'
  | 'shortTermInvestments'
  | 'receivables'
  | 'inventory'
  | 'otherCurrentAssets'
  | 'totalCurrentAssets'
  | 'propertyPlantAndEquipment'
  | 'goodwillAndIntangibleAssets'
  | 'longTermInvestments'
  | 'otherNonCurrentAssets'
  | 'totalNonCurrentAssets'
  | 'totalAssets'
  | 'payables'
  | 'shortTermDebt'
  | 'deferredCurrentLiabilities'
  | 'otherCurrentLiabilities'
  | 'totalCurrentLiabilities'
  | 'longTermDebt'
  | 'deferredNonCurrentLiabilities'
  | 'otherNonCurrentLiabilities'
  | 'totalNonCurrentLiabilities'
  | 'totalLiabilities'
  | 'commonStock'
  | 'retainedEarnings'
  | 'comprehensiveIncome'
  | 'shareholderEquity'

export type CashFlowStatementKeys =
  | 'netIncome'
  | 'depreciationAndAmortization'
  | 'stockBasedCompensation'
  | 'deferredIncomeTax'
  | 'otherNonCashItems'
  | 'changeInWorkingCapital'
  | 'operatingCashFlow'
  | 'propertyPlantAndEquipmentInvestments'
  | 'acquisitionsAndDisposals'
  | 'investmentPurchaseAndSale'
  | 'otherInvestingActivities'
  | 'investingCashFlow'
  | 'issuancePaymentsOfDebt'
  | 'commonStockIssuance'
  | 'dividendsPaid'
  | 'otherFinancialActivities'
  | 'financingCashFlow'
  | 'beginningCashPosition'
  | 'changesInCash'
  | 'endCashPosition'
  | 'capitalExpenditure'
  | 'freeCashFlow'

export type StatementKeys =
  | IncomeStatementKeys
  | BalanceSheetStatementKeys
  | CashFlowStatementKeys

export type FinancialStatementMap<T> = {
  [FinancialBaseStatement.incomeStatement]: Record<IncomeStatementKeys, T>
  [FinancialBaseStatement.balanceSheet]: Record<BalanceSheetStatementKeys, T>
  [FinancialBaseStatement.cashFlowStatement]: Record<CashFlowStatementKeys, T>
}

export const FinancialStatementConfig: FinancialStatementMap<SecurityFinancialBaseResult> =
  {
    [FinancialBaseStatement.incomeStatement]: {
      revenue: {
        label: 'Revenue',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 0,
      },
      costOfRevenue: {
        label: 'Cost of revenue',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 1,
      },
      grossProfit: {
        label: 'Gross profit',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 2,
      },
      researchAndDevelopmentExpenses: {
        label: 'R&D expenses',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 3,
      },
      generalAndAdministrativeExpenses: {
        label: 'SG&A expenses',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 4,
      },
      otherExpenses: {
        label: 'Other expenses',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 5,
      },
      operatingExpenses: {
        label: 'Operating expenses',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 6,
      },
      costAndExpenses: {
        label: 'Cost and expenses',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 7,
      },
      operatingIncome: {
        label: 'Operating income',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 8,
      },
      nonOperatingIncome: {
        label: 'Non-operating income',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 9,
      },
      incomeBeforeTax: {
        label: 'Income before tax',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 10,
      },
      incomeTaxExpense: {
        label: 'Income tax expense',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 11,
      },
      netIncome: {
        label: 'Net income',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 12,
      },
      interestExpense: {
        label: 'Interest expense',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 13,
      },
      ebit: {
        label: 'EBIT',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 14,
      },
      depreciationAndAmortization: {
        label: 'Depreciation and amortization',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 15,
      },
      ebitda: {
        label: 'EBITDA',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 16,
      },
      sharesOutstanding: {
        label: 'Shares outstanding',
        unitType: FinancialUnitType.amount,
        isMain: false,
        index: 17,
      },
      sharesOutstandingDiluted: {
        label: 'Shares outstanding diluted',
        unitType: FinancialUnitType.amount,
        isMain: false,
        index: 18,
      },
      eps: {
        label: 'EPS',
        unitType: FinancialUnitType.currency,
        unit: FinancialUnit.unit,
        isMain: true,
        index: 19,
      },
      epsDiluted: {
        label: 'EPS Diluted',
        unitType: FinancialUnitType.currency,
        unit: FinancialUnit.unit,
        isMain: true,
        index: 20,
      },
    },
    [FinancialBaseStatement.balanceSheet]: {
      cashAndCashEquivalents: {
        label: 'Cash and cash equivalents',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 0,
      },
      shortTermInvestments: {
        label: 'Short-term investments',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 1,
      },
      receivables: {
        label: 'Receivables',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 2,
      },
      inventory: {
        label: 'Inventory',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 3,
      },
      otherCurrentAssets: {
        label: 'Other current assets',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 4,
      },
      totalCurrentAssets: {
        label: 'Total current assets',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 5,
      },
      propertyPlantAndEquipment: {
        label: 'Property, Plant, And Equipment',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 6,
      },
      goodwillAndIntangibleAssets: {
        label: 'Goodwill and Intangible assets',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 7,
      },
      longTermInvestments: {
        label: 'Long-term investments',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 8,
      },
      otherNonCurrentAssets: {
        label: 'Other non-current assets',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 9,
      },
      totalNonCurrentAssets: {
        label: 'Total non-current assets',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 10,
      },
      totalAssets: {
        label: 'Total assets',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 11,
      },
      payables: {
        label: 'Payables',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 12,
      },
      shortTermDebt: {
        label: 'Short-term debt',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 13,
      },
      deferredCurrentLiabilities: {
        label: 'Deferred liabilities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 14,
      },
      otherCurrentLiabilities: {
        label: 'Other current liabilities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 15,
      },
      totalCurrentLiabilities: {
        label: 'Total current liabilities',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 16,
      },
      longTermDebt: {
        label: 'Long-term debt',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 17,
      },
      deferredNonCurrentLiabilities: {
        label: 'Deferred liabilities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 18,
      },
      otherNonCurrentLiabilities: {
        label: 'Other non-current liabilities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 19,
      },
      totalNonCurrentLiabilities: {
        label: 'Total non-current liabilities',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 20,
      },
      totalLiabilities: {
        label: 'Total liabilities',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 21,
      },
      commonStock: {
        label: 'Common stock',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 22,
      },
      retainedEarnings: {
        label: 'Retained earnings',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 23,
      },
      comprehensiveIncome: {
        label: 'Comprehensive Income',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 24,
      },
      shareholderEquity: {
        label: 'Shareholder equity',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 25,
      },
    },
    [FinancialBaseStatement.cashFlowStatement]: {
      netIncome: {
        label: 'Net income',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 0,
      },
      depreciationAndAmortization: {
        label: 'Depreciation and amortization',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 1,
      },
      stockBasedCompensation: {
        label: 'Stock based compensation',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 2,
      },
      deferredIncomeTax: {
        label: 'Deferred income tax',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 3,
      },
      otherNonCashItems: {
        label: 'Other non-cash items',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 4,
      },
      changeInWorkingCapital: {
        label: 'Change in working capital',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 5,
      },
      operatingCashFlow: {
        label: 'Operating Cash Flow',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 6,
      },
      propertyPlantAndEquipmentInvestments: {
        label: 'Property, Plant and Equipment investments',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 7,
      },
      acquisitionsAndDisposals: {
        label: 'Acquisitions and disposals',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 8,
      },
      investmentPurchaseAndSale: {
        label: 'Investment purchase and sale',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 9,
      },
      otherInvestingActivities: {
        label: 'Other investing activities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 10,
      },
      investingCashFlow: {
        label: 'Investing cash flow',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 11,
      },
      issuancePaymentsOfDebt: {
        label: 'Issuance payments of debt',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 12,
      },
      commonStockIssuance: {
        label: 'Common stock issuance',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 13,
      },
      dividendsPaid: {
        label: 'Dividends paid',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 14,
      },
      otherFinancialActivities: {
        label: 'Other financial activities',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 15,
      },
      financingCashFlow: {
        label: 'Financing cash flow',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 16,
      },
      beginningCashPosition: {
        label: 'Beginning cash position',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 17,
      },
      changesInCash: {
        label: 'Changes in cash',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 18,
      },
      endCashPosition: {
        label: 'End cash position',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 19,
      },
      capitalExpenditure: {
        label: 'Capital expenditure',
        unitType: FinancialUnitType.currency,
        isMain: false,
        index: 20,
      },
      freeCashFlow: {
        label: 'Free cash flow',
        unitType: FinancialUnitType.currency,
        isMain: true,
        index: 21,
      },
    },
  }
