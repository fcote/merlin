import { gql } from '@apollo/client'

import userAccountFragment from '@api/_fragments/userAccount'

const useSelfUserAccountSyncMutation = gql`
  mutation selfUserAccountSync($inputs: UserAccountSyncFields!) {
    self {
      syncUserAccount(inputs: $inputs) {
        ...UserAccountFragment
      }
    }
  }
  ${userAccountFragment}
`

export default useSelfUserAccountSyncMutation
