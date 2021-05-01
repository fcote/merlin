import { gql } from '@apollo/client'

import financialItemFragment from '@api/_fragments/financialItem'

const useFinancialItemsQuery = gql`
  query getFinancialItems(
    $filters: FinancialItemFilters!
    $paginate: PaginationOptions
  ) {
    financialItems(
      filters: $filters
      paginate: $paginate
      orderBy: [{ field: "index", direction: "asc" }]
    ) {
      total
      nodes {
        ...FinancialItemFragment
      }
    }
  }
  ${financialItemFragment}
`

export default useFinancialItemsQuery
