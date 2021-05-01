import useSelfUserAccountUpsertMutation from '@hooks/api/mutations/useSelfUserAccountUpsert/useSelfUserAccountUpsert.mutation'
import useMutation from '@hooks/api/useMutation'

import UserAccount from '@lib/userAccount'

const useSelfUserAccountUpsert = () => {
  const [
    selfUserAccountUpsert,
    { loading: selfUserAccountUpsertLoading },
  ] = useMutation<UserAccount, { inputs: Partial<UserAccount> }>(
    useSelfUserAccountUpsertMutation,
    { namespace: 'self' }
  )

  return {
    selfUserAccountUpsert,
    selfUserAccountUpsertLoading,
  }
}

export { useSelfUserAccountUpsert }
