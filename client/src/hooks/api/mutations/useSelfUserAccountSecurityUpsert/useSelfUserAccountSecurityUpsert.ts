import useSelfUserAccountSecurityUpsertMutation from '@hooks/api/mutations/useSelfUserAccountSecurityUpsert/useSelfUserAccountSecurityUpsert.mutation'
import useMutation from '@hooks/api/useMutation'

import UserAccountSecurity from '@lib/userAccountSecurity'

export type UserAccountSecurityInputs = Partial<UserAccountSecurity> & {
  securityTicker?: string
}

const useSelfUserAccountSecurityUpsert = () => {
  const [
    selfUserAccountSecurityUpsert,
    { loading: selfUserAccountSecurityUpsertLoading },
  ] = useMutation<UserAccountSecurity, { inputs: UserAccountSecurityInputs }>(
    useSelfUserAccountSecurityUpsertMutation,
    { namespace: 'self' }
  )

  return {
    selfUserAccountSecurityUpsert,
    selfUserAccountSecurityUpsertLoading,
  }
}

export { useSelfUserAccountSecurityUpsert }
