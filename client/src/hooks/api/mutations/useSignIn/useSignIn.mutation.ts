import { gql } from '@apollo/client'

const useSignInMutation = gql`
  mutation signIn($inputs: SignInFields!) {
    userSignIn(inputs: $inputs) {
      id
      username
      apiToken
    }
  }
`

export default useSignInMutation
