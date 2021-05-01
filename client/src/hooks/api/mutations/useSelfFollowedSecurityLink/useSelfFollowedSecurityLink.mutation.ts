import { gql } from '@apollo/client'

import followedSecurityFragment from '@api/_fragments/followedSecurity'

const useSelfFollowedSecurityLinkMutation = gql`
  mutation selfFollowedSecurityLink($inputs: FollowedSecurityFields!) {
    self {
      linkFollowedSecurity(inputs: $inputs) {
        ...FollowedSecurityFragment
      }
    }
  }
  ${followedSecurityFragment}
`

export default useSelfFollowedSecurityLinkMutation
