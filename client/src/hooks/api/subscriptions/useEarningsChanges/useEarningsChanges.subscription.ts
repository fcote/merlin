import { gql } from '@apollo/client'

import earningFragment from '@api/_fragments/earning'

const useEarningsChangesSubscription = gql`
  subscription onEarnings($tickers: [String!]!) {
    earningsChanges(tickers: $tickers) {
      ...EarningFragment
    }
  }
  ${earningFragment}
`

export default useEarningsChangesSubscription
