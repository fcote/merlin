import { LineData, WhitespaceData } from 'lightweight-charts'
import { mean } from 'lodash'

import { HistoricalPrice } from '@lib/historicalPrice'

const sma = (
  prices: HistoricalPrice[] = [],
  range?: number
): (LineData | WhitespaceData)[] => {
  const num = range ?? prices.length
  const res: (LineData | WhitespaceData)[] = []
  const len = prices.length
  let idx = num - 1
  while (++idx < len) {
    const value = mean(prices.slice(idx - range, idx).map((hp) => hp.close))
    res.push({
      time: prices[idx].date,
      value,
    })
  }
  return res
}

export { sma }
