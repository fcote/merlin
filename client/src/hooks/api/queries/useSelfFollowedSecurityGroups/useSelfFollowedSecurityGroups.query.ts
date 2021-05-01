import { gql } from '@apollo/client'

import followedSecurityGroupFragment from '@api/_fragments/followedSecurityGroup'

const selfFollowedSecurityGroupsQuery = gql`
  query selfUserFollowedSecurityGroups($filters: FollowedSecurityGroupFilters) {
    self {
      followedSecurityGroups(
        filters: $filters
        orderBy: [{ field: "index", direction: "asc" }]
      ) {
        nodes {
          ...FollowedSecurityGroupFragment
        }
      }
    }
  }
  ${followedSecurityGroupFragment}
`

export default selfFollowedSecurityGroupsQuery
