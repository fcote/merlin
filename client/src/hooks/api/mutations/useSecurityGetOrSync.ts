import { useState, useEffect } from 'react'

import { invalidateCache } from '@helpers/invalidateCache'

import { useSecuritySync } from '@hooks/api/mutations/useSecuritySync'
import { useSecurity } from '@hooks/api/queries/useSecurity'
import { useSecuritySyncProgressChanges } from '@hooks/api/subscriptions/useSecuritySyncProgressChanges/useSecuritySyncProgressChanges'

import { Security } from '@lib/security'

const useSecurityGetOrSync = (providedTicker?: string) => {
  const [security, setSecurity] = useState<Security>()
  const [ticker, setTicker] = useState<string>()

  const { securitySync, securitySyncLoading } = useSecuritySync()
  const { getSecurity, loading: getSecurityLoading } = useSecurity()
  const { securitySyncProgress } = useSecuritySyncProgressChanges(ticker)

  const syncSecurity = async (t: string) => {
    const createdSecurity = await securitySync({
      variables: { ticker: t },
    })

    invalidateCache(t)

    setSecurity(createdSecurity)
    return createdSecurity
  }

  const getOrSyncSecurity = async (t: string) => {
    if (!t) return

    setTicker(t)
    const existingSecurity = await getSecurity({ variables: { ticker: t } })
    if (existingSecurity) {
      setSecurity(existingSecurity)
      return existingSecurity
    }

    return syncSecurity(t)
  }

  useEffect(() => {
    if (!providedTicker) return
    void getOrSyncSecurity(providedTicker)
  }, [providedTicker])

  return {
    security,
    securitySyncProgress:
      securitySyncLoading || getSecurityLoading
        ? securitySyncProgress
        : undefined,
    securityLoading: securitySyncLoading || getSecurityLoading,
    getOrSyncSecurity,
    syncSecurity,
  }
}

export default useSecurityGetOrSync
