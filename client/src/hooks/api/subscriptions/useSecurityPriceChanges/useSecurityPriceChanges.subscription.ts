import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const useSecurityPriceChangesSubscription = gql`
  subscription onSecurityPrice($tickers: [String!]!) {
    securityPriceChanges(tickers: $tickers) {
      ...SecurityFragment
    }
  }

  ${securityFragment}
`

export default useSecurityPriceChangesSubscription
