import { gql } from '@apollo/client'

import followedSecurityGroupFragment from '@api/_fragments/followedSecurityGroup'

const useSelfFollowedSecurityGroupUpsertMutation = gql`
  mutation selfFollowedSecurityGroupUpsert(
    $inputs: FollowedSecurityGroupFields!
  ) {
    self {
      upsertFollowedSecurityGroup(inputs: $inputs) {
        ...FollowedSecurityGroupFragment
      }
    }
  }
  ${followedSecurityGroupFragment}
`

export default useSelfFollowedSecurityGroupUpsertMutation
