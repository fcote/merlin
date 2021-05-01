import { gql } from '@apollo/client'

import earningFragment from '@api/_fragments/earning'

const useEarningsQuery = gql`
  query getEarnings($filters: EarningFilters!) {
    earnings(
      filters: $filters
      orderBy: [{ field: "date", direction: "desc" }]
    ) {
      nodes {
        ...EarningFragment
      }
    }
  }
  ${earningFragment}
`

export default useEarningsQuery
