import { gql } from '@apollo/client'

import financialFragment from '@api/_fragments/financial'

const useFinancialsQuery = gql`
  query getFinancials(
    $filters: FinancialFindFilters!
    $paginate: PaginationOptions
  ) {
    financials(
      filters: $filters
      paginate: $paginate
      orderBy: [{ field: "reportDate", direction: "desc" }]
    ) {
      total
      nodes {
        ...FinancialFragment
      }
    }
  }
  ${financialFragment}
`

export default useFinancialsQuery
