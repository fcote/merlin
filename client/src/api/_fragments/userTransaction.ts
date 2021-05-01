import { gql } from '@apollo/client'

const userTransactionFragment = gql`
  fragment UserTransactionFragment on UserTransaction {
    id
    name
    value
    category
    type
    frequency
    date
  }
`

export default userTransactionFragment
