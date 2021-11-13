import { config } from '@config'
import { FMPLink } from '@links/fmp'
import {
  SearchLink,
  FinancialLink,
  QuoteLink,
  HistoricalPriceLink,
  EarningLink,
  CompanyOverviewLink,
  NewsLink,
  ForexLink,
  AnalystEstimatesLink,
} from '@links/index'
import { MacroTrendsLink } from '@links/macrotrends'
import { seekingAlpha } from '@links/seekingAlpha'
import { yahooFinance } from '@links/yahooFinance'

export const fmp = new FMPLink()
export const macrotrends = new MacroTrendsLink()

export const searchLink: SearchLink = fmp
export const quoteLink: QuoteLink = fmp
export const companyOverviewLink: CompanyOverviewLink = fmp
export const extendedHoursQuotesLink: QuoteLink = seekingAlpha
export const historicalPricesLink: HistoricalPriceLink = fmp
export const forexLink: ForexLink = fmp
export const newsLink: NewsLink | null =
  config.get('datasource.fmp.plan') === 'premium' ? fmp : null
export const earningsLink: EarningLink =
  config.get('links.earnings') === 'fmp' ? fmp : yahooFinance
export const financialsLink: FinancialLink =
  config.get('links.financials') === 'fmp' ? fmp : macrotrends
export const analystEstimatesLink: AnalystEstimatesLink | null =
  config.get('datasource.fmp.plan') === 'premium' ? fmp : null
