import useSelfFollowedSecurityGroupUpsertMutation from '@hooks/api/mutations/useSelfFollowedSecurityGroupUpsert/useSelfFollowedSecurityGroupUpsert.mutation'
import useMutation from '@hooks/api/useMutation'

import FollowedSecurityGroup from '@lib/followedSecurityGroup'

export type FollowedSecurityGroupInputs = Pick<
  FollowedSecurityGroup,
  'name' | 'index' | 'type'
>

const useSelfFollowedSecurityGroupUpsert = () => {
  const [
    selfFollowedSecurityGroupUpsert,
    { loading: selfFollowedSecurityGroupUpsertLoading },
  ] = useMutation<
    FollowedSecurityGroup,
    { inputs: FollowedSecurityGroupInputs }
  >(useSelfFollowedSecurityGroupUpsertMutation, { namespace: 'self' })

  return {
    selfFollowedSecurityGroupUpsert,
    selfFollowedSecurityGroupUpsertLoading,
  }
}

export { useSelfFollowedSecurityGroupUpsert }
