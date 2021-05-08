import { groupBy, sumBy } from 'lodash'
import { useMemo } from 'react'

import { formatBigValue } from '@helpers/formatBigValue'
import { getExchangeRate } from '@helpers/getExchangeRate'
import tableSorter from '@helpers/tableSorter'

import { FinancialUnitType, FinancialUnit } from '@lib/financialItem'
import { Forex } from '@lib/forex'
import { Security } from '@lib/security'
import UserAccountSecurity from '@lib/userAccountSecurity'

export type PortfolioItem = {
  key: string
  name: string
  size: number
  marketCapitalization?: string
  price?: number
  dayChange?: number
  dayChangePercent?: number
  weekChange?: number
  high52Week?: number
  low52Week?: number
  volume: number
  avgOpenPrice: number
  currency: string
  profit: number
  details: {
    openPrice: number
    volume: number
    openedAt: string
  }[]
  security?: Security
}

const securityToItem = (security: Security): Partial<PortfolioItem> => {
  if (!security) return {}
  return {
    price: security.currentPrice,
    dayChange: security.dayChange,
    dayChangePercent: security.dayChangePercent,
    weekChange: security.weekChange,
    marketCapitalization: formatBigValue(
      security.marketCapitalization,
      FinancialUnitType.currency,
      FinancialUnit.millions
    ),
    high52Week: security.high52Week,
    low52Week: security.low52Week,
  }
}

const userSecurityToItem = (
  name: string,
  userSecurities: UserAccountSecurity[],
  userCurrency: string,
  totalAccountValue: number,
  forex: Forex[]
): PortfolioItem => {
  const userSecurity = userSecurities[0]
  const security = userSecurity.security
  const currentPrice = security.currentPrice
  const exchangeRate = getExchangeRate(
    userSecurity.currency,
    userCurrency,
    forex
  )
  const sumVolume = sumBy(userSecurities, (s) => s.volume)
  const sumCurrentValue = sumVolume * (currentPrice * exchangeRate)
  const avgOpenPrice =
    sumBy(userSecurities, (s) => s.openPrice * s.volume) / sumVolume
  const sumOpenValue = sumVolume * (avgOpenPrice * exchangeRate)
  const sumProfit = sumCurrentValue - sumOpenValue
  const sumSize = ((sumVolume * currentPrice) / totalAccountValue) * 100
  return {
    key: userSecurities.map((s) => s.id).join('-'),
    size: sumSize,
    name: security.ticker ?? name,
    volume: sumVolume,
    profit: sumProfit,
    avgOpenPrice: avgOpenPrice,
    currency: userSecurities.find((gs) => gs.currency)?.currency,
    details: userSecurities.map((us) => ({
      openPrice: us.openPrice,
      openedAt: us.openedAt,
      volume: us.volume,
    })),
    security,
    ...securityToItem(userSecurities.find((as) => as.security)?.security),
  }
}

const usePortfolioItems = (
  userSecurities: UserAccountSecurity[],
  userCurrency: string,
  forex: Forex[]
) =>
  useMemo(() => {
    if (!userSecurities?.length || !userCurrency || !forex) return

    const securityGroups = groupBy(userSecurities, (s) => s.security.ticker)
    const totalValue = sumBy(
      userSecurities,
      (s) => s.volume * s.security.currentPrice
    )

    const items = Object.entries(securityGroups).map(
      ([name, groupSecurities]) => {
        return userSecurityToItem(
          name,
          groupSecurities,
          userCurrency,
          totalValue,
          forex
        )
      }
    )

    return items.sort((a, b) => tableSorter('number', 'size', a, b)).reverse()
  }, [userSecurities])

export { usePortfolioItems }
