import { FollowedSecurityGroupType } from '@models/followedSecurityGroup'

class FollowedSecurityGroupFields {
  id?: number | string

  name?: string

  type?: FollowedSecurityGroupType

  index?: number

  userId: string
}

class FollowedSecurityGroupFilters {
  type?: FollowedSecurityGroupType

  userId?: string
}

export { FollowedSecurityGroupFields, FollowedSecurityGroupFilters }
