import useSelfProfileQuery from '@hooks/api/queries/useSelfProfile/useSelfProfile.query'
import useQuery from '@hooks/api/useQuery'

import User from '@lib/user'

const useSelfProfile = () =>
  useQuery<User>(useSelfProfileQuery, {
    namespace: 'self',
  })

export { useSelfProfile }
