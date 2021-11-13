import { FMPLink } from '@links/fmp/link.fmp'
import { FMPQuote } from '@links/fmp/link.fmp.quote'
import { SecuritySearchResult, SecurityListResult } from '@links/types'
import { logger } from '@logger'

export interface FMPSearch {
  symbol: string
  name: string
  currency: string
  stockExchange: string
  exchangeShortName: string
}

export interface FMPList {
  symbol: string
  name: string
}

const toSearchResult = (item: FMPSearch | FMPQuote): SecuritySearchResult => {
  return {
    ticker: item.symbol,
    name: item.name,
    securityType: FMPLink.getSecurityType(item),
  }
}

const toListResult = (item: FMPList): SecurityListResult => {
  return {
    ticker: item.symbol,
    name: item.name,
  }
}

async function fmpSearch(this: FMPLink, input: string) {
  const response = await this.query<FMPSearch[]>(
    this.getEndpoint(`/v3/search-ticker`, {
      query: input,
    })
  )

  if (!response?.length) {
    return []
  }

  return response
    .filter((r) => r.symbol?.replace('^', '') === input)
    .map(toSearchResult)
}

async function fmpGet(this: FMPLink, ticker: string) {
  const response = await this.query<FMPQuote[]>(
    this.getEndpoint(`/v3/quote/${ticker}`)
  )
  if (!response?.length) {
    logger.warn('fmp > could not get security', { ticker })
    return
  }
  const item = response.shift()
  if (!item) {
    return
  }
  return toSearchResult(item)
}

async function fmpList(this: FMPLink) {
  const response = await this.query<FMPQuote[]>(
    this.getEndpoint(`/v3/stock/list`)
  )
  if (!response?.length) {
    return []
  }
  return response.map(toListResult)
}

export { fmpSearch, fmpGet, fmpList }
