import { dayjs } from '@helpers/dayjs'
import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityNewsResult } from '@links/types'
import { logger } from '@logger'
import { NewsType } from '@models/news'

export type FMPNews = {
  symbol: string
  publishedDate: string
  title: string
  image: string
  site: string
  text: string
  url: string
}

export type FMPPressRelease = {
  symbol: string
  date: string
  title: string
  text: string
}

const getDate = (dateString: string): Date => {
  return dayjs
    .tz(dateString, 'YYYY-MM-DD HH:mm:ss', 'America/New_York')
    .toDate()
}

const fmpNewsSecurityNews = (item: FMPNews): SecurityNewsResult => {
  return {
    ticker: item.symbol,
    type: NewsType.standard,
    date: getDate(item.publishedDate),
    title: item.title,
    content: item.text,
    website: item.site,
    url: item.url,
  }
}

const fmpPressReleaseSecurityNews = (
  item: FMPPressRelease
): SecurityNewsResult => {
  return {
    ticker: item.symbol,
    type: NewsType.pressRelease,
    date: getDate(item.date),
    title: item.title,
    content: item.text,
  }
}

async function fmpNews(
  this: FMPLink,
  ticker?: string
): Promise<SecurityNewsResult[]> {
  const newsResponse = await this.query<FMPNews[]>(
    this.getEndpoint(`/v3/stock_news`, {
      ...(ticker && { tickers: ticker }),
      limit: ticker ? '10' : '200',
    })
  )
  const pressReleaseResponse = ticker
    ? await this.query<FMPPressRelease[]>(
        this.getEndpoint(`/v3/press-releases/${ticker}`, {
          limit: '10',
        })
      )
    : []
  if (!newsResponse.length) {
    logger.warn('fmp > missing news')
    return []
  }
  return [
    ...newsResponse.map(fmpNewsSecurityNews),
    ...pressReleaseResponse.map(fmpPressReleaseSecurityNews),
  ]
}

export { fmpNews }
