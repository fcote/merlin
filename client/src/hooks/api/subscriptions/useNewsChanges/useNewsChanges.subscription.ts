import { gql } from '@apollo/client'

import newsFragment from '@api/_fragments/news'

const useNewsChangesSubscription = gql`
  subscription onNews($tickers: [String!]!) {
    newsChanges(tickers: $tickers) {
      ...NewsFragment
    }
  }
  ${newsFragment}
`

export default useNewsChangesSubscription
