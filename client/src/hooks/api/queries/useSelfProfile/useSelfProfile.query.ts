import { gql } from '@apollo/client'

const useSelfProfileQuery = gql`
  query getProfile {
    self {
      user {
        id
        username
        currency
      }
    }
  }
`

export default useSelfProfileQuery
