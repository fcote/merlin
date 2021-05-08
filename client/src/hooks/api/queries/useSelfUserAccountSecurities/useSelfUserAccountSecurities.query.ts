import { gql } from '@apollo/client'

import userAccountSecurityFragment from '@api/_fragments/userAccountSecurity'

const useSelfUserAccountSecuritiesQuery = gql`
  query selfUserAccountSecurities($filters: UserAccountSecurityFilters) {
    self {
      userAccountSecurities(
        filters: $filters
        orderBy: [{ field: "name", direction: "asc" }]
      ) {
        nodes {
          ...UserAccountSecurityFragment
        }
      }
    }
  }
  ${userAccountSecurityFragment}
`

export default useSelfUserAccountSecuritiesQuery
