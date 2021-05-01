import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const followedSecurityGroupFragment = gql`
  fragment FollowedSecurityGroupFragment on FollowedSecurityGroup {
    id
    name
    index
    type
    followedSecurities(orderBy: [{ field: "id", direction: "desc" }]) {
      nodes {
        id
        alias
        index
        security {
          ...SecurityFragment
        }
      }
    }
  }
  ${securityFragment}
`

export default followedSecurityGroupFragment
