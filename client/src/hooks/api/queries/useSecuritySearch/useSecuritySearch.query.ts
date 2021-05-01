import { gql } from '@apollo/client'

const useSecuritySearchQuery = gql`
  query securitySearch($ticker: String!) {
    searchSecurity(ticker: $ticker) {
      ticker
      name
      securityType
    }
  }
`

export default useSecuritySearchQuery
