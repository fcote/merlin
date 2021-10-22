import { gql } from '@apollo/client'

import earningFragment from '@api/_fragments/earning'

const selfFollowedSecurityGroupsQuery = gql`
  query selfUserFollowedSecurityGroups($filters: EarningFilters) {
    self {
      earnings(
        filters: $filters
        orderBy: [{ field: "date", direction: "asc" }]
      ) {
        nodes {
          ...EarningFragment
          security {
            id
            ticker
            followedIn
            company {
              id
              name
            }
          }
        }
      }
    }
  }
  ${earningFragment}
`

export default selfFollowedSecurityGroupsQuery
