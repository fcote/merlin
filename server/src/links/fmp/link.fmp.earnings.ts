import { minBy, min } from 'lodash'

import { dayjs } from '@helpers/dayjs'
import { FMPLink } from '@links/fmp/link.fmp'
import { SecurityEarningResult } from '@links/types'
import { logger } from '@logger'
import { EarningTime } from '@models/earning'

type FMPEarning = {
  date: string
  symbol: string
  eps: number
  epsEstimated: number
  time: 'bmo' | 'amc'
  revenue: number
  revenueEstimated: number
}

type FMPEarningCall = [number, number, string]

type FMPEarningCallTranscript = {
  date: string
  symbol: string
  quarter: number
  year: number
  content: string
}

const formatTime = (time: string) => {
  if (time === 'bmo') return EarningTime.beforeMarketOpen
  if (time === 'amc') return EarningTime.afterMarketClose
  return null
}

const computeFiscalPeriod = (
  closestEarningCall: FMPEarningCall,
  daysDiff: number
) => {
  const quarterDuration = daysDiff > 0 ? -90 : 90
  const [quarter, year] = closestEarningCall
  const nQuarterToAdd = min([-daysDiff, quarterDuration]) as number
  const callDate = dayjs().year(year).quarter(quarter).add(nQuarterToAdd, 'day')
  return { year: callDate.year(), quarter: callDate.quarter() }
}

const getEarningCall = (
  item: FMPEarning,
  earningCallItems: FMPEarningCall[]
): FMPEarningCall | undefined => {
  const earningDate = dayjs(item.date)
  const earningCallDaysDiffs = earningCallItems.map((earningCall) => {
    const [_, __, callDate] = earningCall
    return {
      call: earningCall,
      diff: dayjs(callDate).diff(earningDate, 'day', true),
    }
  })

  const closest = minBy(earningCallDaysDiffs, (earning) =>
    Math.abs(earning.diff)
  )
  if (!closest) return

  const closestDistance = Math.abs(closest.diff)
  if (closestDistance <= 7) {
    return closest.call
  }

  const { quarter, year } = computeFiscalPeriod(closest.call, closest.diff)
  return [quarter, year, item.date]
}

const toEarningResult = (
  item: FMPEarning,
  earningCall?: FMPEarningCall
): SecurityEarningResult => {
  const [fiscalQuarter, fiscalYear] = earningCall ?? []
  const epsSurprisePercent =
    item.epsEstimated && item.eps
      ? ((item.eps - item.epsEstimated) / Math.abs(item.epsEstimated)) * 100
      : null
  const revenueSurprisePercent =
    item.revenueEstimated && item.revenue
      ? ((item.revenue - item.revenueEstimated) /
          Math.abs(item.revenueEstimated)) *
        100
      : null
  return {
    date: item.date,
    fiscalYear: fiscalYear ?? null,
    fiscalQuarter: fiscalQuarter ?? null,
    time: formatTime(item.time),
    eps: item.eps,
    epsEstimate: item.epsEstimated,
    revenue: item.revenue ? item.revenue / 1e6 : null,
    revenueEstimate: item.revenueEstimated ? item.revenueEstimated / 1e6 : null,
    epsSurprisePercent,
    revenueSurprisePercent,
  }
}

async function fmpEarnings(
  this: FMPLink,
  ticker: string
): Promise<SecurityEarningResult[]> {
  const earningDatesResponse = await this.query<FMPEarning[]>(
    this.getEndpoint(`/v3/historical/earning_calendar/${ticker}`)
  )
  const earningCallsResponse = await this.query<FMPEarningCall[]>(
    this.getEndpoint(`/v4/earning_call_transcript`, {
      symbol: ticker,
    })
  )
  if (!earningDatesResponse.length) {
    logger.warn('fmp > missing earning dates', { ticker })
    return []
  }
  return earningDatesResponse.map((i) =>
    toEarningResult(i, getEarningCall(i, earningCallsResponse))
  )
}

async function fmpEarningCallTranscript(
  this: FMPLink,
  ticker: string,
  fiscalYear: number,
  fiscalQuarter: number
): Promise<string | undefined> {
  const response = await this.query<FMPEarningCallTranscript[]>(
    this.getEndpoint(`/v3/earning_call_transcript/${ticker}`, {
      quarter: fiscalQuarter.toString(),
      year: fiscalYear.toString(),
    })
  )
  if (!response?.length) {
    logger.warn('fmp > missing earning call transcript', {
      ticker,
      fiscalYear,
      fiscalQuarter,
    })
    return
  }
  return response?.shift()?.content
}

export { fmpEarnings, fmpEarningCallTranscript }
