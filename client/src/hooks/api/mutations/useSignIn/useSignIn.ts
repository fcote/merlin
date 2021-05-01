import useSignInMutation from '@hooks/api/mutations/useSignIn/useSignIn.mutation'
import useMutation from '@hooks/api/useMutation'

import User from '@lib/user'

export type AuthInputs = {
  username: string
  password: string
}

const useSignIn = () => {
  const [signIn, { loading: signInLoading }] = useMutation<
    User,
    { inputs: AuthInputs }
  >(useSignInMutation)
  return { signIn, signInLoading }
}

export { useSignIn }
