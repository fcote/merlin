import got, { Got, Method } from 'got'
import fetch from 'node-fetch'
import { CookieJar } from 'tough-cookie'
import { URL } from 'url'

import { config } from '@config'
import { timeout } from '@helpers/timeout'
import {
  SecuritySearchResult,
  SecurityQuoteResult,
  SecurityFinancialResult,
  SecurityHistoricalPriceResult,
  SecurityEarningResult,
  SecurityListResult,
  SecurityCompanyOverviewResult,
  SecurityNewsResult,
  ForexExchangeRateResult,
} from '@links/types'
import { logger } from '@logger'
import { FinancialFreq } from '@models/financial'

export interface APILinkConfig {
  endpoint: string
  base: string
  headers?: { [key: string]: string }
  apiKey?: {
    mode: 'param' | 'header'
    param: string
    value: string
  }
}

export interface SearchLink {
  search: (ticker: string) => Promise<SecuritySearchResult[]>
  get: (ticker: string) => Promise<SecuritySearchResult>
  list: () => Promise<SecurityListResult[]>
}

export interface QuoteLink {
  quote: (ticker: string) => Promise<SecurityQuoteResult>
  batchQuotes: (tickers: string[]) => Promise<SecurityQuoteResult[]>
}

export interface CompanyOverviewLink {
  companyOverview: (ticker: string) => Promise<SecurityCompanyOverviewResult>
  batchCompanyOverview: (
    tickers: string[]
  ) => Promise<SecurityCompanyOverviewResult[]>
}

export interface HistoricalPriceLink {
  historicalPrices: (ticker: string) => Promise<SecurityHistoricalPriceResult[]>
}

export interface FinancialLink {
  financials: (
    ticker: string,
    freq: FinancialFreq
  ) => Promise<SecurityFinancialResult[]>
}

export interface AnalystEstimatesLink {
  analystEstimates: (
    ticker: string,
    freq: FinancialFreq
  ) => Promise<SecurityFinancialResult[]>
}

export interface EarningLink {
  earnings: (
    ticker: string,
    fiscalYearEndMonth?: number
  ) => Promise<SecurityEarningResult[]>
  earningCallTranscript?: (
    ticker: string,
    fiscalYear: number,
    fiscalQuarter: number
  ) => Promise<string>
}

export interface NewsLink {
  news: (ticker?: string) => Promise<SecurityNewsResult[]>
}

export interface ForexLink {
  exchangeRates: () => Promise<ForexExchangeRateResult[]>
}

export class APILink {
  private client: Got

  private static timeout: number = 60 * 1000

  constructor(protected conf: APILinkConfig) {
    this.client = got.extend({
      cookieJar: new CookieJar(),
      responseType: 'json',
      timeout: APILink.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `merlin/${config.get('app.version')}`,
        ...(this.conf.headers && this.conf.headers),
        ...(this.conf.apiKey?.mode === 'header' && {
          [this.conf.apiKey.param]: this.conf.apiKey.value,
        }),
      },
    })
  }

  query = async <T>(
    url: URL,
    method: Method = 'GET',
    body?: any
  ): Promise<T> => {
    const options = {
      method,
      ...(body && { json: body }),
    }
    try {
      return await this.client(encodeURI(url.toString()), options).json<T>()
    } catch (err) {
      if (err?.response?.statusCode === 429) {
        await this.handleTooManyRequestsError(url, method, body)
      }
      logger.error(`link > ${err.message}`, { err })
      throw err
    }
  }

  page = async (url: URL): Promise<string> => {
    let response = await fetch(url)
    const responseUrl = new URL(response.url)

    // Re-fetch if there was a redirection
    if (url.search !== responseUrl.search) {
      responseUrl.search = url.search
      response = await fetch(responseUrl)
    }

    return response.text()
  }

  getEndpoint = (path: string, params: Record<string, string> = {}) => {
    const url = new URL(`${this.conf.base}${path}`, this.conf.endpoint)

    if (this.conf.apiKey?.mode === 'param') {
      url.searchParams.append(this.conf.apiKey.param, this.conf.apiKey.value)
    }
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    return url
  }
  private handleTooManyRequestsError = async (
    url: URL,
    method: Method = 'GET',
    body?: any
  ) => {
    logger.info(
      'link > got code 429 (too many requests), waiting 1 min before retrying...'
    )
    await timeout(APILink.timeout)
    return this.query(url, method, body)
  }
}
