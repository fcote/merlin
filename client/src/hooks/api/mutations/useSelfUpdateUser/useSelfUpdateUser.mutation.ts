import { gql } from '@apollo/client'

const useSelfUpdateUserMutation = gql`
  mutation updateUser($inputs: UserFields!) {
    self {
      updateUser(inputs: $inputs) {
        id
        username
        currency
      }
    }
  }
`

export default useSelfUpdateUserMutation
