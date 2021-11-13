import { JSDOM } from 'jsdom'

import { dayjs } from '@helpers/dayjs'
import { SecurityEarningResult } from '@links/types'
import { YahooFinanceLink } from '@links/yahooFinance/link.yahooFinance.link'
import { logger } from '@logger'

const getCellNumberValue = (tr: HTMLTableRowElement, index: number) => {
  const textValue = tr.cells.item(index)?.textContent?.replace('%', '')
  if (!textValue) return null
  return !['', '-'].includes(textValue) ? Number(textValue) : null
}

const getDate = (rawDate: string) => {
  return dayjs
    .utc(`${rawDate}`, 'MMM DD, YYYY, h A')
    .toISOString()
    .substring(0, 10)
}

async function yahooFinanceEarnings(
  this: YahooFinanceLink,
  ticker: string
): Promise<SecurityEarningResult[]> {
  const page = await this.page(
    this.getEndpoint('/calendar/earnings/', {
      symbol: ticker,
    })
  )
  const dom = new JSDOM(page)
  const document = dom.window.document as Document
  const earningsTable = document
    .getElementById('fin-cal-table')
    ?.querySelector('table')
  if (!earningsTable) {
    logger.warn('yahooFinance > missing earning dates', { ticker })
    return []
  }
  const tableContent = earningsTable.querySelector('tbody')

  const results: SecurityEarningResult[] = []

  tableContent?.childNodes.forEach((node) => {
    const tr = node as HTMLTableRowElement
    const date = tr.cells.item(2)?.childNodes.item(0).textContent
    const epsEstimate = getCellNumberValue(tr, 3)
    const epsActual = getCellNumberValue(tr, 4)
    const surprisePercent = getCellNumberValue(tr, 5)

    if (!date) return

    results.push({
      date: getDate(date),
      epsEstimate: epsEstimate,
      eps: epsActual,
      epsSurprisePercent: surprisePercent,
    })
  })

  return results
}

export { yahooFinanceEarnings }
