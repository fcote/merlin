import { gql } from '@apollo/client'

import userAccountFragment from '@api/_fragments/userAccount'

const useSelfUserAccountsQuery = gql`
  query selfUserAccounts($filters: UserAccountFilters) {
    self {
      userAccounts(
        filters: $filters
        orderBy: [{ field: "name", direction: "asc" }]
      ) {
        nodes {
          ...UserAccountFragment
        }
      }
    }
  }
  ${userAccountFragment}
`

export default useSelfUserAccountsQuery
