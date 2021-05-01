import useHistoricalPricesQuery from '@hooks/api/queries/useHistoricalPrices/useHistoricalPrices.query'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { HistoricalPrice } from '@lib/historicalPrice'

export type HistoricalPriceFilters = {
  ticker: string
}

const useHistoricalPrices = () => {
  const [getHistoricalPrices, { data, ...rest }] = useLazyPaginatedQuery<
    HistoricalPrice,
    { filters: HistoricalPriceFilters }
  >(useHistoricalPricesQuery)

  return { ...rest, getHistoricalPrices, historicalPrices: data }
}

export { useHistoricalPrices }
