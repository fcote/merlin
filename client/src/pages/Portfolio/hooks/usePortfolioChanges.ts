import { sumBy } from 'lodash'
import { useMemo } from 'react'

import { dayjs } from '@helpers/dayjs'
import { getExchangeRate } from '@helpers/getExchangeRate'

import { Forex } from '@lib/forex'

import { PortfolioItem } from '@pages/Portfolio/hooks/usePortfolioItems'

export type PortfolioChange = {
  value?: number
  percent?: number
}

const usePortfolioChanges = (
  portfolioItems: PortfolioItem[],
  userCurrency: string,
  forex: Forex[]
) => {
  const portfolioSum = useMemo(() => {
    if (!portfolioItems?.length || !userCurrency || !forex) return

    return sumBy(portfolioItems, (pi) => {
      const exchangeRate = getExchangeRate(pi.currency, userCurrency, forex)
      return pi.volume * (pi.security.currentPrice * exchangeRate)
    })
  }, [portfolioItems, userCurrency, forex])

  return useMemo(() => {
    if (!portfolioItems?.length || !portfolioSum) return {}

    const securitySum = (
      portfolioItem: PortfolioItem,
      property: 'dayChange' | 'weekChange' | 'allTime'
    ) => {
      const exchangeRate = getExchangeRate(
        portfolioItem.currency,
        userCurrency,
        forex
      )
      if (property === 'allTime') {
        return (
          portfolioItem.volume * (portfolioItem.avgOpenPrice * exchangeRate)
        )
      }

      return sumBy(portfolioItem.details, (us) => {
        const openedAt = dayjs(us.openedAt)
        const lastDay = dayjs().subtract(1, 'day').hour(23).minute(59)
        const lastWeekDay = dayjs().isoWeekday(-2).hour(23).minute(59)

        if (
          (property === 'dayChange' && lastDay.isBefore(openedAt)) ||
          (property === 'weekChange' && lastWeekDay.isBefore(openedAt))
        ) {
          return us.volume * (us.openPrice * exchangeRate)
        }

        return (
          us.volume *
          (portfolioItem.security.currentPrice -
            portfolioItem.security[property]) *
          exchangeRate
        )
      })
    }
    const previousSum = (property: 'dayChange' | 'weekChange' | 'allTime') =>
      sumBy(portfolioItems, (userSecurity) =>
        securitySum(userSecurity, property)
      )

    const change = (sum: number): PortfolioChange => ({
      value: portfolioSum - sum,
      percent: ((portfolioSum - sum) / sum) * 100,
    })

    const startOfDaySum = previousSum('dayChange')
    const startOfWeekSum = previousSum('weekChange')
    const allTimeSum = previousSum('allTime')

    return {
      portfolioDayChange: change(startOfDaySum),
      portfolioWeekChange: change(startOfWeekSum),
      portfolioAllTimeChange: change(allTimeSum),
    }
  }, [portfolioSum, portfolioItems])
}

export { usePortfolioChanges }
