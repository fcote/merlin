import useSelfFollowedSecurityUnlinkMutation from '@hooks/api/mutations/useSelfFollowedSecurityUnlink/useSelfFollowedSecurityUnlink.mutation'
import useMutation from '@hooks/api/useMutation'

import FollowedSecurity from '@lib/followedSecurity'

export type FollowedSecurityUnlinkInputs = Pick<
  FollowedSecurity,
  'followedSecurityGroupId' | 'securityId'
>

const useSelfFollowedSecurityUnlink = () => {
  const [
    selfFollowedSecurityUnlink,
    { loading: selfFollowedSecurityUnlinkLoading },
  ] = useMutation<number, { inputs: FollowedSecurityUnlinkInputs }>(
    useSelfFollowedSecurityUnlinkMutation,
    { namespace: 'self' }
  )
  return {
    selfFollowedSecurityUnlink,
    selfFollowedSecurityUnlinkLoading,
  }
}

export { useSelfFollowedSecurityUnlink }
