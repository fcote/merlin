import { encrypt, decrypt } from '@helpers/crypt'

import useSelfUserAccountSyncMutation from '@hooks/api/mutations/useSelfUserAccountSync/useSelfUserAccountSync.mutation'
import useMutation from '@hooks/api/useMutation'

import UserAccount from '@lib/userAccount'

export type UserAccountSyncInputs = {
  id: string
  username: string
  password: string
}

const useSelfUserAccountSync = () => {
  const [
    selfUserAccountSync,
    { loading: selfUserAccountSyncLoading },
  ] = useMutation<UserAccount, { inputs: UserAccountSyncInputs }>(
    useSelfUserAccountSyncMutation,
    { namespace: 'self' }
  )

  const getCredentials = (accountId: string) => {
    const rawCredentials = localStorage.getItem(
      `accounts-credentials-${accountId}`
    )
    if (!rawCredentials) return

    const { password: rawPassword, username } = JSON.parse(rawCredentials)
    const password = decrypt(rawPassword, 's3cr3t')

    return { username, password }
  }

  const saveCredentials = (inputs: UserAccountSyncInputs) => {
    localStorage.setItem(
      `accounts-credentials-${inputs.id}`,
      JSON.stringify({
        username: inputs.username,
        password: encrypt(inputs.password, 's3cr3t'),
      })
    )
  }

  return {
    selfUserAccountSync,
    selfUserAccountSyncLoading,
    getCredentials,
    saveCredentials,
  }
}

export { useSelfUserAccountSync }
