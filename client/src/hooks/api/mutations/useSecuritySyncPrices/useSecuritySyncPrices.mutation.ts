import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const useSecuritySyncPricesMutation = gql`
  mutation securitySyncPrices($tickers: [String!]!) {
    syncSecurityPrices(tickers: $tickers) {
      ...SecurityFragment
    }
  }
  ${securityFragment}
`

export default useSecuritySyncPricesMutation
