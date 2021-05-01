import { gql } from '@apollo/client'

import userAccountFragment from '@api/_fragments/userAccount'

const useSelfUserAccountUpsertMutation = gql`
  mutation selfUserAccountUpsert($inputs: UserAccountFields!) {
    self {
      upsertUserAccount(inputs: $inputs) {
        ...UserAccountFragment
      }
    }
  }
  ${userAccountFragment}
`

export default useSelfUserAccountUpsertMutation
