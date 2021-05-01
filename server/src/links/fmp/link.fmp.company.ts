import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityCompanyOverviewResult } from '@links/types'
import { logger } from '@logger'

export interface FMPCompanyOverview {
  symbol: string
  price: number
  beta: number
  volAvg: number
  mktCap: number
  lastDiv: number
  range: string
  changes: string
  companyName: string
  currency: string
  cik: string
  isin: string
  cusip: string
  exchange: string
  exchangeShortName: string
  industry: string
  website: string
  description: string
  ceo: string
  sector: string
  country: string
  fullTimeEmployees: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  dcfDiff: number
  dcf: number
  image: string
  ipoDate: string
  isEtf: boolean
  isActivelyTrading: boolean
}

const toCompanyOverviewResult = (
  item: FMPCompanyOverview
): SecurityCompanyOverviewResult => {
  return {
    symbol: item.symbol,
    cik: item.cik,
    isin: item.isin,
    cusip: item.cusip,
    name: item.companyName,
    currency: item.currency,
    description: item.description,
    sector: item.sector && item.sector !== '' ? item.sector : null,
    industry: item.industry && item.industry !== '' ? item.industry : null,
    address: `${item.address}, ${item.city}, ${item.state}, ${item.country}`,
    employees: Number(item.fullTimeEmployees),
    securityType: FMPLink.getSecurityType(item),
  }
}

async function fmpBatchCompanyOverview(
  this: FMPLink,
  tickers: string[]
): Promise<SecurityCompanyOverviewResult[]> {
  const response = await this.query<FMPCompanyOverview[]>(
    this.getEndpoint(`/v3/profile/${tickers.join(',')}`)
  )
  if (!response.length) {
    logger.warn('fmp > could not fetch security company overview', { tickers })
    return []
  }
  return response.map(toCompanyOverviewResult)
}

async function fmpCompanyOverview(
  this: FMPLink,
  ticker: string
): Promise<SecurityCompanyOverviewResult> {
  const response = await this.batchCompanyOverview([ticker])
  return response?.shift()
}

export { fmpCompanyOverview, fmpBatchCompanyOverview }
