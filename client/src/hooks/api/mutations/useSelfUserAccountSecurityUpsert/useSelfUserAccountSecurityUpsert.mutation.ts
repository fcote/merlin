import { gql } from '@apollo/client'

import userAccountSecurityFragment from '@api/_fragments/userAccountSecurity'

const useSelfUserAccountSecurityUpsertMutation = gql`
  mutation selfUserAccountSecurityUpsert($inputs: UserAccountSecurityFields!) {
    self {
      upsertUserAccountSecurity(inputs: $inputs) {
        ...UserAccountSecurityFragment
      }
    }
  }
  ${userAccountSecurityFragment}
`

export default useSelfUserAccountSecurityUpsertMutation
