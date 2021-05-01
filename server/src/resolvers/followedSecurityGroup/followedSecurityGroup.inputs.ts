import { InputType, Field, ID, Int } from 'type-graphql'

import { FollowedSecurityGroupType } from '@models/followedSecurityGroup'

@InputType('FollowedSecurityGroupFields')
class FollowedSecurityGroupFields {
  @Field((_) => ID, { nullable: true })
  id?: number | string
  @Field((_) => String, { nullable: true })
  name?: string
  @Field((_) => FollowedSecurityGroupType, { nullable: true })
  type?: FollowedSecurityGroupType
  @Field((_) => Int, { nullable: true })
  index?: number

  userId: string
}

@InputType('FollowedSecurityGroupFilters')
class FollowedSecurityGroupFilters {
  @Field((_) => FollowedSecurityGroupType, { nullable: true })
  type?: FollowedSecurityGroupType

  userId?: string
}

export { FollowedSecurityGroupFields, FollowedSecurityGroupFilters }
