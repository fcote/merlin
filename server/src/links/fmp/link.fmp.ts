import { get } from 'lodash'

import { config } from '@config'
import {
  APILink,
  SearchLink,
  QuoteLink,
  FinancialLink,
  HistoricalPriceLink,
  CompanyOverviewLink,
  EarningLink,
  NewsLink,
  ForexLink,
  AnalystEstimatesLink,
} from '@links'
import { fmpAnalystEstimates } from '@links/fmp/link.fmp.analystEstimates'
import {
  fmpCompanyOverview,
  fmpBatchCompanyOverview,
  FMPCompanyOverview,
} from '@links/fmp/link.fmp.company'
import {
  fmpEarnings,
  fmpEarningCallTranscript,
} from '@links/fmp/link.fmp.earnings'
import { fmpFinancials } from '@links/fmp/link.fmp.financial'
import { fmpExchangeRates } from '@links/fmp/link.fmp.forex'
import { fmpHistoricalPrices } from '@links/fmp/link.fmp.historicalPrice'
import { fmpNews } from '@links/fmp/link.fmp.news'
import { fmpQuote, fmpBatchQuotes, FMPQuote } from '@links/fmp/link.fmp.quote'
import {
  fmpSearch,
  FMPSearch,
  fmpGet,
  fmpList,
} from '@links/fmp/link.fmp.search'
import {
  SecuritySearchResult,
  SecurityFinancialResult,
  SecurityHistoricalPriceResult,
  SecurityQuoteResult,
  SecurityListResult,
  SecurityCompanyOverviewResult,
  SecurityEarningResult,
  SecurityNewsResult,
  ForexExchangeRateResult,
} from '@links/types'
import { FinancialFreq } from '@models/financial'
import { SecurityType } from '@models/security'

class FMPLink
  extends APILink
  implements
    SearchLink,
    QuoteLink,
    CompanyOverviewLink,
    FinancialLink,
    AnalystEstimatesLink,
    HistoricalPriceLink,
    EarningLink,
    NewsLink,
    ForexLink
{
  constructor() {
    super({
      endpoint: 'https://financialmodelingprep.com/',
      base: '/api',
      apiKey: {
        mode: 'param',
        param: 'apikey',
        value: config.get('datasource.fmp.key'),
      },
    })
  }

  static getSecurityType = (
    item: FMPSearch | FMPQuote | FMPCompanyOverview
  ): SecurityType => {
    if (
      get(item, 'exchangeShortName') === 'INDEX' ||
      get(item, 'exchange') === 'INDEX'
    ) {
      return SecurityType.index
    }
    if (
      get(item, 'exchangeShortName') === 'MUTUAL_FUND' ||
      get(item, 'exchange') === 'MUTUAL_FUND'
    ) {
      return SecurityType.mutualFund
    }
    if (
      get(item, 'exchangeShortName') === 'COMMODITY' ||
      get(item, 'exchange') === 'COMMODITY'
    ) {
      return SecurityType.commodity
    }
    if (
      new RegExp('ETF|ETN|Index|Fund|Trust').test(get(item, 'name')) ||
      get(item, 'isEtf')
    ) {
      return SecurityType.etf
    }
    return SecurityType.commonStock
  }

  // Search
  search = async (ticker: string): Promise<SecuritySearchResult[]> => {
    return fmpSearch.bind(this, ticker)()
  }
  get = async (ticker: string): Promise<SecuritySearchResult | undefined> => {
    return fmpGet.bind(this, ticker)()
  }
  list = async (): Promise<SecurityListResult[]> => {
    return fmpList.bind(this)()
  }

  // Quotes
  quote = async (ticker: string): Promise<SecurityQuoteResult | undefined> => {
    return fmpQuote.bind(this, ticker)()
  }

  batchQuotes = async (tickers: string[]): Promise<SecurityQuoteResult[]> => {
    return fmpBatchQuotes.bind(this, tickers)()
  }

  // Company
  companyOverview = async (
    ticker: string
  ): Promise<SecurityCompanyOverviewResult | undefined> => {
    return fmpCompanyOverview.bind(this, ticker)()
  }
  batchCompanyOverview = async (
    tickers: string[]
  ): Promise<SecurityCompanyOverviewResult[]> => {
    return fmpBatchCompanyOverview.bind(this, tickers)()
  }

  // Financials
  financials = async (
    ticker: string,
    freq: FinancialFreq
  ): Promise<SecurityFinancialResult[]> => {
    return fmpFinancials.bind(this, ticker, freq)()
  }

  // Analyst estimates
  analystEstimates = async (
    ticker: string,
    freq: FinancialFreq
  ): Promise<SecurityFinancialResult[]> => {
    return fmpAnalystEstimates.bind(this, ticker, freq)()
  }

  // Historical prices
  historicalPrices = async (
    ticker: string
  ): Promise<SecurityHistoricalPriceResult[]> => {
    return fmpHistoricalPrices.bind(this, ticker)()
  }

  // Earning dates
  earnings = async (ticker: string): Promise<SecurityEarningResult[]> => {
    return fmpEarnings.bind(this, ticker)()
  }
  earningCallTranscript = async (
    ticker: string,
    fiscalYear: number,
    fiscalQuarter: number
  ): Promise<string | undefined> => {
    return fmpEarningCallTranscript.bind(
      this,
      ticker,
      fiscalYear,
      fiscalQuarter
    )()
  }

  // News
  news = async (ticker?: string): Promise<SecurityNewsResult[]> => {
    return fmpNews.bind(this, ticker)()
  }

  // Forex
  exchangeRates = async (): Promise<ForexExchangeRateResult[]> => {
    return fmpExchangeRates.bind(this)()
  }
}

export { FMPLink }
