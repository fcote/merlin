import { InputType, Field, Int, ID } from 'type-graphql'

@InputType('FollowedSecurityFilters')
class FollowedSecurityFilters {
  @Field((_) => [Int], { nullable: true })
  indexes?: number[]
}

@InputType('FollowedSecurityFields')
class FollowedSecurityFields {
  @Field((_) => String, { nullable: true })
  technicalAnalysis?: string
  @Field((_) => String, { nullable: true })
  alias?: string
  @Field((_) => Int, { nullable: true })
  index?: number
  @Field((_) => ID, { nullable: true })
  followedSecurityGroupId?: number | string
  @Field((_) => ID, { nullable: true })
  securityId?: number | string
}

export { FollowedSecurityFields, FollowedSecurityFilters }
