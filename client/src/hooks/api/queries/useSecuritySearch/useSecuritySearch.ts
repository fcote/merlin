import useSecuritySearchQuery from '@hooks/api/queries/useSecuritySearch/useSecuritySearch.query'
import useLazyQuery from '@hooks/api/useLazyQuery'

import SecuritySearch from '@lib/securitySearch'

const useSecuritySearch = () => {
  const [securitySearch, { data, loading }] = useLazyQuery<
    SecuritySearch[],
    { ticker: string }
  >(useSecuritySearchQuery, {
    fetchPolicy: 'network-only',
  })

  return { securitySearch, securitySearchResults: data, loading }
}

export { useSecuritySearch }
