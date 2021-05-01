import useForexQuery from '@hooks/api/queries/useForex/useForex.query'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { Forex } from '@lib/forex'

export type ForexCurrencyPair = {
  fromCurrency: string
  toCurrency: string
}

export type ForexFilters = {
  currencyPairs: ForexCurrencyPair[]
}

const useForex = () => {
  const [getForex, { data, ...rest }] = useLazyPaginatedQuery<
    Forex,
    { filters: ForexFilters }
  >(useForexQuery)

  return { ...rest, getForex, forex: data }
}

export { useForex }
