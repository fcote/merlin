import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const useSecurityQuery = gql`
  query getSecurity($ticker: String!) {
    security(ticker: $ticker) {
      ...SecurityFragment
    }
  }
  ${securityFragment}
`

export default useSecurityQuery
