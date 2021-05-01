import useSelfUpdateUserMutation from '@hooks/api/mutations/useSelfUpdateUser/useSelfUpdateUser.mutation'
import useMutation from '@hooks/api/useMutation'

import User from '@lib/user'

const useSelfUpdateUser = () => {
  const [selfUpdateUser, { loading: selUpdateUserLoading }] = useMutation<
    User,
    { inputs: Partial<User> }
  >(useSelfUpdateUserMutation, { namespace: 'self' })

  return {
    selfUpdateUser,
    selUpdateUserLoading,
  }
}

export { useSelfUpdateUser }
