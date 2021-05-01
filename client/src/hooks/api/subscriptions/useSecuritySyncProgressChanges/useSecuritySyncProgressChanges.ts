import { useMemo } from 'react'

import useSecuritySyncProgressChangesSubscription from '@hooks/api/subscriptions/useSecuritySyncProgressChanges/useSecuritySyncProgressChanges.subscription'
import { useSubscription } from '@hooks/api/useSubscription'

import { SecuritySyncProgressChange } from '@lib/security'

const useSecuritySyncProgressChanges = (ticker: string) => {
  const { data } = useSubscription<SecuritySyncProgressChange>(
    useSecuritySyncProgressChangesSubscription,
    {
      skip: !ticker,
      variables: { ticker },
    }
  )

  const securitySyncProgress = useMemo(() => {
    if (!data) return
    return Math.round(data.progress * 100)
  }, [data])

  return { securitySyncProgress }
}

export { useSecuritySyncProgressChanges }
