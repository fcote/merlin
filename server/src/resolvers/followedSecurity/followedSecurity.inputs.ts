class FollowedSecurityFilters {
  indexes?: number[]
}

class FollowedSecurityFields {
  technicalAnalysis?: string

  alias?: string

  index?: number

  followedSecurityGroupId?: number | string

  securityId?: number | string
}

export { FollowedSecurityFields, FollowedSecurityFilters }
