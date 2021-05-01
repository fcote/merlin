import { groupBy, sumBy, sortBy } from 'lodash'

import {
  SecurityFinancialResult,
  SecurityFinancialBaseResult,
} from '@links/types'
import { Financial } from '@models/financial'
import { FinancialBaseStatement } from '@models/financialItem'
import {
  StatementKeys,
  FinancialStatementConfig,
} from '@typings/financial/financialStatement'

class FinancialTTMProcessor {
  private readonly financials: { [key: string]: Financial[] }

  private values: Partial<Record<StatementKeys, number>> = {}

  constructor(quarterFinancials: Financial[]) {
    this.financials = groupBy(
      sortBy(quarterFinancials, (f) => f.reportDate).reverse(),
      (f) => f.financialItem.slug
    )
    this.computeTTM()
  }

  public ttm = (): SecurityFinancialResult[] => {
    return Object.values(FinancialBaseStatement).flatMap((statement) => {
      return Object.entries(FinancialStatementConfig[statement]).flatMap(
        ([slug, baseResult]: [StatementKeys, SecurityFinancialBaseResult]) => ({
          statement,
          slug,
          reportDate: 'TTM',
          unit: this.last(slug)?.financialItem?.unit ?? baseResult.unit,
          unitType:
            this.last(slug)?.financialItem?.unitType ?? baseResult.unitType,
          value: Number.isFinite(this.values[slug]) ? this.values[slug] : null,
          ...baseResult,
        })
      )
    })
  }

  private sum = (key: StatementKeys) => {
    return sumBy(this.financials[key], (f) => f.value)
  }

  private last = (key: StatementKeys) => {
    return this.financials[key]?.slice(0, 2)?.shift()
  }

  private lastValue = (key: StatementKeys) => {
    return this.last(key)?.value
  }

  private computeTTM = () => {
    // Income statement
    this.values.revenue = this.sum('revenue')
    this.values.costOfRevenue = this.sum('costOfRevenue')
    this.values.grossProfit = this.sum('grossProfit')
    this.values.researchAndDevelopmentExpenses = this.sum(
      'researchAndDevelopmentExpenses'
    )
    this.values.generalAndAdministrativeExpenses = this.sum(
      'generalAndAdministrativeExpenses'
    )
    this.values.otherExpenses = this.sum('otherExpenses')
    this.values.operatingExpenses = this.sum('operatingExpenses')
    this.values.costAndExpenses = this.sum('costAndExpenses')
    this.values.operatingIncome = this.sum('operatingIncome')
    this.values.nonOperatingIncome = this.sum('nonOperatingIncome')
    this.values.incomeBeforeTax = this.sum('incomeBeforeTax')
    this.values.incomeTaxExpense = this.sum('incomeTaxExpense')
    this.values.netIncome = this.sum('netIncome')
    this.values.interestExpense = this.sum('interestExpense')
    this.values.ebit = this.sum('ebit')
    this.values.depreciationAndAmortization = this.sum(
      'depreciationAndAmortization'
    )
    this.values.ebitda = this.sum('ebitda')
    this.values.sharesOutstanding = this.lastValue('sharesOutstanding')
    this.values.sharesOutstandingDiluted = this.lastValue(
      'sharesOutstandingDiluted'
    )
    this.values.eps = this.values.netIncome / this.values.sharesOutstanding
    this.values.epsDiluted =
      this.values.netIncome / this.values.sharesOutstandingDiluted

    // Balance sheet
    this.values.cashAndCashEquivalents = this.lastValue(
      'cashAndCashEquivalents'
    )
    this.values.shortTermInvestments = this.lastValue('shortTermInvestments')
    this.values.receivables = this.lastValue('receivables')
    this.values.inventory = this.lastValue('inventory')
    this.values.otherCurrentAssets = this.lastValue('otherCurrentAssets')
    this.values.totalCurrentAssets = this.lastValue('totalCurrentAssets')
    this.values.propertyPlantAndEquipment = this.lastValue(
      'propertyPlantAndEquipment'
    )
    this.values.goodwillAndIntangibleAssets = this.lastValue(
      'goodwillAndIntangibleAssets'
    )
    this.values.longTermInvestments = this.lastValue('longTermInvestments')
    this.values.otherNonCurrentAssets = this.lastValue('otherNonCurrentAssets')
    this.values.totalNonCurrentAssets = this.lastValue('totalNonCurrentAssets')
    this.values.totalAssets = this.lastValue('totalAssets')
    this.values.payables = this.lastValue('payables')
    this.values.shortTermDebt = this.lastValue('shortTermDebt')
    this.values.deferredCurrentLiabilities = this.lastValue(
      'deferredCurrentLiabilities'
    )
    this.values.otherCurrentLiabilities = this.lastValue(
      'otherCurrentLiabilities'
    )
    this.values.totalCurrentLiabilities = this.lastValue(
      'totalCurrentLiabilities'
    )
    this.values.longTermDebt = this.lastValue('longTermDebt')
    this.values.deferredNonCurrentLiabilities = this.lastValue(
      'deferredNonCurrentLiabilities'
    )
    this.values.otherNonCurrentLiabilities = this.lastValue(
      'otherNonCurrentLiabilities'
    )
    this.values.totalNonCurrentLiabilities = this.lastValue(
      'totalNonCurrentLiabilities'
    )
    this.values.totalLiabilities = this.lastValue('totalLiabilities')
    this.values.commonStock = this.lastValue('commonStock')
    this.values.retainedEarnings = this.lastValue('retainedEarnings')
    this.values.comprehensiveIncome = this.lastValue('comprehensiveIncome')
    this.values.shareholderEquity = this.lastValue('shareholderEquity')

    // Cash flow statement
    this.values.netIncome = this.sum('netIncome')
    this.values.depreciationAndAmortization = this.sum(
      'depreciationAndAmortization'
    )
    this.values.stockBasedCompensation = this.sum('stockBasedCompensation')
    this.values.deferredIncomeTax = this.sum('deferredIncomeTax')
    this.values.otherNonCashItems = this.sum('otherNonCashItems')
    this.values.changeInWorkingCapital = this.sum('changeInWorkingCapital')
    this.values.operatingCashFlow = this.sum('operatingCashFlow')
    this.values.propertyPlantAndEquipmentInvestments = this.sum(
      'propertyPlantAndEquipmentInvestments'
    )
    this.values.acquisitionsAndDisposals = this.sum('acquisitionsAndDisposals')
    this.values.investmentPurchaseAndSale = this.sum(
      'investmentPurchaseAndSale'
    )
    this.values.otherInvestingActivities = this.sum('otherInvestingActivities')
    this.values.investingCashFlow = this.sum('investingCashFlow')
    this.values.issuancePaymentsOfDebt = this.sum('issuancePaymentsOfDebt')
    this.values.commonStockIssuance = this.sum('commonStockIssuance')
    this.values.dividendsPaid = this.sum('dividendsPaid')
    this.values.otherFinancialActivities = this.sum('otherFinancialActivities')
    this.values.financingCashFlow = this.sum('financingCashFlow')
    this.values.beginningCashPosition = this.sum('beginningCashPosition')
    this.values.changesInCash = this.sum('changesInCash')
    this.values.endCashPosition = this.sum('endCashPosition')
    this.values.capitalExpenditure = this.sum('capitalExpenditure')
    this.values.freeCashFlow = this.sum('freeCashFlow')
  }
}

export { FinancialTTMProcessor }
