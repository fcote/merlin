import useSecuritySyncMutation from '@hooks/api/mutations/useSecuritySync/useSecuritySync.mutation'
import useMutation from '@hooks/api/useMutation'

import { Security } from '@lib/security'

const useSecuritySync = () => {
  const [securitySync, { loading: securitySyncLoading }] = useMutation<
    Security,
    { ticker: string }
  >(useSecuritySyncMutation)
  return { securitySync, securitySyncLoading }
}

export { useSecuritySync }
