import useSecurityPriceChangesSubscription from '@hooks/api/subscriptions/useSecurityPriceChanges/useSecurityPriceChanges.subscription'
import { useSubscription } from '@hooks/api/useSubscription'

import { SecurityPriceChange } from '@lib/security'

const useSecurityPriceChanges = (tickers: string[]) => {
  const { data: securityPriceChange } = useSubscription<SecurityPriceChange>(
    useSecurityPriceChangesSubscription,
    {
      skip: !tickers?.length,
      variables: { tickers },
    }
  )

  return { securityPriceChange }
}

export { useSecurityPriceChanges }
