import { gql } from '@apollo/client'

import financialFragment from '@api/_fragments/financial'
import financialItemFragment from '@api/_fragments/financialItem'

const useFinancialsTTMQuery = gql`
  query getFinancialsTTM($ticker: String!) {
    financials(
      filters: { freq: TTM, type: ratio, ticker: $ticker }
      orderBy: [{ field: "reportDate", direction: "desc" }]
    ) {
      total
      nodes {
        ...FinancialFragment
        financialItem {
          ...FinancialItemFragment
        }
      }
    }
  }
  ${financialFragment}
  ${financialItemFragment}
`

export default useFinancialsTTMQuery
