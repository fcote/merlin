import useSelfEarningsQuery from '@hooks/api/queries/useSelfEarnings/useSelfEarnings.query'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import { Earning } from '@lib/earning'

const useSelfEarnings = (fromDate: string) =>
  usePaginatedQuery<Earning>(useSelfEarningsQuery, {
    variables: {
      filters: { fromDate },
    },
    namespace: 'self',
  })

export { useSelfEarnings }
