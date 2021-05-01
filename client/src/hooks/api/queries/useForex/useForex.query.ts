import { gql } from '@apollo/client'

import forexFragment from '@api/_fragments/forex'

const useForexQuery = gql`
  query getForex($filters: ForexFilters!) {
    forex(filters: $filters) {
      nodes {
        ...ForexFragment
      }
    }
  }
  ${forexFragment}
`

export default useForexQuery
