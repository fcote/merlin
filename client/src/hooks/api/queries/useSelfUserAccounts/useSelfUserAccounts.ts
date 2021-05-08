import useSelfUserAccountsQuery from '@hooks/api/queries/useSelfUserAccounts/useSelfUserAccounts.query'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import UserAccount, { UserAccountType } from '@lib/userAccount'

const useSelfUserAccounts = (type?: UserAccountType) =>
  usePaginatedQuery<UserAccount>(useSelfUserAccountsQuery, {
    namespace: 'self',
    variables: {
      filters: { types: [type] },
    },
  })

export { useSelfUserAccounts }
