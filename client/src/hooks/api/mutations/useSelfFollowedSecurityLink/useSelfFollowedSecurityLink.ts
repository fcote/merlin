import useSelfFollowedSecurityLinkMutation from '@hooks/api/mutations/useSelfFollowedSecurityLink/useSelfFollowedSecurityLink.mutation'
import useMutation from '@hooks/api/useMutation'

import FollowedSecurity from '@lib/followedSecurity'

export type FollowedSecurityLinkInputs = Partial<
  Pick<
    FollowedSecurity,
    'alias' | 'index' | 'followedSecurityGroupId' | 'securityId'
  >
>

const useSelfFollowedSecurityLink = () => {
  const [
    selfFollowedSecurityLink,
    { loading: selfFollowedSecurityLinkLoading },
  ] = useMutation<FollowedSecurity, { inputs: FollowedSecurityLinkInputs }>(
    useSelfFollowedSecurityLinkMutation,
    { namespace: 'self' }
  )
  return {
    selfFollowedSecurityLink,
    selfFollowedSecurityLinkLoading,
  }
}

export { useSelfFollowedSecurityLink }
