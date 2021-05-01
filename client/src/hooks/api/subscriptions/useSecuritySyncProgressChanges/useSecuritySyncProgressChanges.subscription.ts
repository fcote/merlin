import { gql } from '@apollo/client'

const useSecuritySyncProgressChangesSubscription = gql`
  subscription onSecuritySyncProgress($ticker: String!) {
    securitySyncProgressChanges(ticker: $ticker) {
      ticker
      progress
    }
  }
`

export default useSecuritySyncProgressChangesSubscription
