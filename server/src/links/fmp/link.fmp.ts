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
} from '@links'
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
    HistoricalPriceLink,
    EarningLink,
    NewsLink,
    ForexLink {
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
    if (item['exchangeShortName'] === 'INDEX' || item['exchange'] === 'INDEX') {
      return SecurityType.index
    }
    if (
      item['exchangeShortName'] === 'MUTUAL_FUND' ||
      item['exchange'] === 'MUTUAL_FUND'
    ) {
      return SecurityType.mutualFund
    }
    if (
      item['exchangeShortName'] === 'COMMODITY' ||
      item['exchange'] === 'COMMODITY'
    ) {
      return SecurityType.commodity
    }
    if (
      new RegExp('ETF|ETN|Index|Fund|Trust').test(item['name']) ||
      item['isEtf']
    ) {
      return SecurityType.etf
    }
    return SecurityType.commonStock
  }

  // Search
  search = async (ticker: string): Promise<SecuritySearchResult[]> => {
    return fmpSearch.bind(this, ticker)()
  }
  get = async (ticker: string): Promise<SecuritySearchResult> => {
    return fmpGet.bind(this, ticker)()
  }
  list = async (): Promise<SecurityListResult[]> => {
    return fmpList.bind(this)()
  }

  // Quotes
  quote = async (ticker: string): Promise<SecurityQuoteResult> => {
    return fmpQuote.bind(this, ticker)()
  }

  batchQuotes = async (tickers: string[]): Promise<SecurityQuoteResult[]> => {
    return fmpBatchQuotes.bind(this, tickers)()
  }

  // Company
  companyOverview = async (
    ticker: string
  ): Promise<SecurityCompanyOverviewResult> => {
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

  // Historical prices
  historicalPrices = async (
    ticker: string
  ): Promise<SecurityHistoricalPriceResult[]> => {
    return fmpHistoricalPrices.bind(this, ticker)()
  }

  // Earning dates
  earnings = async (
    ticker: string,
    fiscalYearEndMonth?: number
  ): Promise<SecurityEarningResult[]> => {
    return fmpEarnings.bind(this, ticker, fiscalYearEndMonth)()
  }
  earningCallTranscript = async (
    ticker: string,
    fiscalYear: number,
    fiscalQuarter: number
  ): Promise<string> => {
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
