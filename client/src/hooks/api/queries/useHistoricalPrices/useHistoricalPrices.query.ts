import { gql } from '@apollo/client'

import historicalPriceFragment from '@api/_fragments/historicalPrice'

const useHistoricalPricesQuery = gql`
  query getHistoricalPrices($filters: HistoricalPriceFilters!) {
    historicalPrices(
      filters: $filters
      orderBy: [{ field: "date", direction: "asc" }]
    ) {
      nodes {
        ...HistoricalPriceFragment
      }
    }
  }
  ${historicalPriceFragment}
`

export default useHistoricalPricesQuery
