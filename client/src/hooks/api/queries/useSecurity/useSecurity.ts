import useSecurityQuery from '@hooks/api/queries/useSecurity/useSecurity.query'
import useLazyQuery from '@hooks/api/useLazyQuery'

import { Security } from '@lib/security'

const useSecurity = () => {
  const [getSecurity, { data, ...rest }] = useLazyQuery<
    Security,
    { ticker: string }
  >(useSecurityQuery, {
    fetchPolicy: 'network-only',
  })

  return { ...rest, getSecurity, security: data }
}

export { useSecurity }
