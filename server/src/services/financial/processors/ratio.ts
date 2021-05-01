import { keyBy, sum } from 'lodash'

import {
  SecurityFinancialResult,
  SecurityFinancialBaseResult,
} from '@links/types'
import { Financial, FinancialFreq } from '@models/financial'
import {
  FinancialRatioStatement,
  FinancialUnit,
  FinancialUnitType,
} from '@models/financialItem'
import {
  FinancialRatioConfig,
  RatioKeys,
} from '@typings/financial/financialRatioStatement'
import { StatementKeys } from '@typings/financial/financialStatement'

class FinancialRatioProcessor {
  private static defaultUnit: FinancialUnit = FinancialUnit.percent
  private static defaultUnitType: FinancialUnitType = FinancialUnitType.ratio

  private values: Partial<Record<RatioKeys, number>> = {}

  private readonly days: number
  private readonly financials: { [key: string]: Financial }

  constructor(
    private reportDate: string,
    private price: number,
    financials: Financial[],
    freq: FinancialFreq
  ) {
    this.financials = keyBy(financials, (f) => f.financialItem.slug)
    this.days = freq === FinancialFreq.Q ? 92 : 365
    this.computeRatios()
  }

  public ratios = (): SecurityFinancialResult[] => {
    return Object.values(FinancialRatioStatement).flatMap((statement) => {
      return Object.entries(FinancialRatioConfig[statement]).flatMap(
        ([slug, baseResult]: [string, SecurityFinancialBaseResult]) => ({
          statement,
          reportDate: this.reportDate,
          slug: slug,
          unit: FinancialRatioProcessor.defaultUnit,
          unitType: FinancialRatioProcessor.defaultUnitType,
          value: Number.isFinite(this.values[slug]) ? this.values[slug] : null,
          ...baseResult,
        })
      )
    })
  }

  private financial = (slug: StatementKeys) => {
    return this.financials[slug]?.value ?? 0
  }

  private ratio = (values: StatementKeys[], dividedBy: StatementKeys[]) => {
    return sum(values.map(this.financial)) / sum(dividedBy.map(this.financial))
  }

  private computeRatios = () => {
    // Liquidity
    this.values.currentRatio = this.ratio(
      ['totalCurrentAssets'],
      ['totalCurrentLiabilities']
    )
    this.values.quickRatio = this.ratio(
      ['cashAndCashEquivalents', 'shortTermInvestments', 'receivables'],
      ['totalCurrentLiabilities']
    )
    this.values.cashRatio = this.ratio(
      ['cashAndCashEquivalents'],
      ['totalCurrentLiabilities']
    )
    this.values.daysOfSalesOutstanding =
      this.financial('receivables') / (this.financial('revenue') / this.days)
    this.values.daysOfInventoryOutstanding =
      this.financial('inventory') /
      (this.financial('costOfRevenue') / this.days)
    this.values.daysOfPayablesOutstanding =
      this.financial('payables') / (this.financial('costOfRevenue') / this.days)
    this.values.operatingCycle =
      this.values.daysOfSalesOutstanding +
      this.values.daysOfInventoryOutstanding
    this.values.cashConversionCycle =
      this.values.daysOfSalesOutstanding +
      this.values.daysOfInventoryOutstanding -
      this.values.daysOfPayablesOutstanding

    // Profitability
    this.values.grossProfitMargin = this.ratio(['grossProfit'], ['revenue'])
    this.values.operatingProfitMargin = this.ratio(
      ['operatingIncome'],
      ['revenue']
    )
    this.values.pretaxProfitMargin = this.ratio(
      ['incomeBeforeTax'],
      ['revenue']
    )
    this.values.netProfitMargin = this.ratio(['netIncome'], ['revenue'])
    this.values.effectiveTaxRate = this.ratio(
      ['incomeTaxExpense'],
      ['incomeBeforeTax']
    )
    this.values.returnOnAssets = this.ratio(['netIncome'], ['totalAssets'])
    this.values.returnOnEquity = this.ratio(
      ['netIncome'],
      ['shareholderEquity']
    )
    this.values.returnOnCapitalEmployed =
      this.financial('ebit') /
      (this.financial('totalAssets') -
        this.financial('totalCurrentLiabilities'))
    this.values.ebitPerRevenue = this.ratio(['ebit'], ['revenue'])

    // Debt
    this.values.debtRatio = this.ratio(['totalLiabilities'], ['totalAssets'])
    this.values.debtToEquity = this.ratio(
      ['totalLiabilities'],
      ['shareholderEquity']
    )
    this.values.debtToCapitalization = this.ratio(
      ['totalLiabilities'],
      ['totalLiabilities', 'shareholderEquity']
    )
    this.values.cashFlowToDebt = this.ratio(
      ['operatingCashFlow'],
      ['totalLiabilities']
    )
    this.values.equityMultiplier = this.ratio(
      ['totalAssets'],
      ['shareholderEquity']
    )

    // Operating performance
    this.values.fixedAssetTurnover = this.ratio(
      ['revenue'],
      ['propertyPlantAndEquipment']
    )
    this.values.assetTurnover = this.ratio(['revenue'], ['totalAssets'])

    // Cash flow
    this.values.operatingCashFlowToSales = this.ratio(
      ['operatingCashFlow'],
      ['revenue']
    )
    this.values.freeCashFlowToOperatingCashFlow = this.ratio(
      ['freeCashFlow'],
      ['operatingCashFlow']
    )
    this.values.cashFlowCoverage = this.ratio(
      ['operatingCashFlow'],
      ['totalLiabilities']
    )
    this.values.shortTermCashFlowCoverage = this.ratio(
      ['operatingCashFlow'],
      ['totalCurrentLiabilities']
    )
    this.values.capitalExpenditureCoverage =
      this.financial('operatingCashFlow') /
      -this.financial('capitalExpenditure')

    // Valuation
    this.values.priceToBookValue =
      sum([this.price]) /
      this.ratio(['shareholderEquity'], ['sharesOutstanding'])
    this.values.priceToCashFlow =
      sum([this.price]) /
      this.ratio(['operatingCashFlow'], ['sharesOutstanding'])
    this.values.priceToFreeCashFlow =
      sum([this.price]) / this.ratio(['freeCashFlow'], ['sharesOutstanding'])
    this.values.priceToEarnings = sum([this.price]) / this.financial('eps')
    this.values.priceToSales =
      sum([this.price]) / this.ratio(['revenue'], ['sharesOutstanding'])
  }
}

export { FinancialRatioProcessor }
