import useSecuritySyncPricesMutation from '@hooks/api/mutations/useSecuritySyncPrices/useSecuritySyncPrices.mutation'
import useMutation from '@hooks/api/useMutation'

import { Security } from '@lib/security'

const useSecuritySyncPrices = () => {
  const [securitySyncPrices, { loading: securitySyncPricesLoading }] =
    useMutation<Security[], { tickers: string[] }>(
      useSecuritySyncPricesMutation
    )
  return { securitySyncPrices, securitySyncPricesLoading }
}

export { useSecuritySyncPrices }
