import { gql } from '@apollo/client'

const followedSecurityFragment = gql`
  fragment FollowedSecurityFragment on FollowedSecurity {
    id
    alias
    index
  }
`

export default followedSecurityFragment
