import { gql } from '@apollo/client'

const userAccountFragment = gql`
  fragment UserAccountFragment on UserAccount {
    id
    name
    type
    provider
    balance
  }
`

export default userAccountFragment
