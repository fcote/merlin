import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const useSecuritySyncMutation = gql`
  mutation securitySync($ticker: String!) {
    syncSecurity(ticker: $ticker) {
      ...SecurityFragment
    }
  }
  ${securityFragment}
`

export default useSecuritySyncMutation
