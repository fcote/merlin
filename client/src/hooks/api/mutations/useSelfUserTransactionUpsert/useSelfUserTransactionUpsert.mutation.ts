import { gql } from '@apollo/client'

import userTransactionFragment from '@api/_fragments/userTransaction'

const useSelfUserTransactionUpsertMutation = gql`
  mutation selfUserTransactionUpsert($inputs: UserTransactionFields!) {
    self {
      upsertUserTransaction(inputs: $inputs) {
        ...UserTransactionFragment
      }
    }
  }
  ${userTransactionFragment}
`

export default useSelfUserTransactionUpsertMutation
