import { gql } from '@apollo/client'

const useSelfFollowedSecurityUnlinkMutation = gql`
  mutation selfFollowedSecurityUnlink($inputs: FollowedSecurityFields!) {
    self {
      unlinkFollowedSecurity(inputs: $inputs)
    }
  }
`

export default useSelfFollowedSecurityUnlinkMutation
