import useSelfUserTransactionUpsertMutation from '@hooks/api/mutations/useSelfUserTransactionUpsert/useSelfUserTransactionUpsert.mutation'
import useMutation from '@hooks/api/useMutation'

import UserTransaction from '@lib/userTransaction'

const useSelfUserTransactionUpsert = () => {
  const [
    selfUserTransactionUpsert,
    { loading: selfUserTransactionUpsertLoading },
  ] = useMutation<UserTransaction, { inputs: Partial<UserTransaction> }>(
    useSelfUserTransactionUpsertMutation,
    { namespace: 'self' }
  )

  return {
    selfUserTransactionUpsert,
    selfUserTransactionUpsertLoading,
  }
}

export { useSelfUserTransactionUpsert }
