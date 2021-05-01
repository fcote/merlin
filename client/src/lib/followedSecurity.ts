import { Security } from '@lib/security'

export default interface FollowedSecurity {
  id: string
  technicalAnalysis: string
  alias: string
  index: number
  followedSecurityGroupId: string
  securityId: string
  deletedAt: string

  security?: Security
}
