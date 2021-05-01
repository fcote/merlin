import FollowedSecurity from '@lib/followedSecurity'

export enum FollowedSecurityGroupType {
  tracker = 'tracker',
  watchlist = 'watchlist',
}

export default interface FollowedSecurityGroup {
  id: string
  name: string
  type: FollowedSecurityGroupType
  index: number
  deletedAt: string

  followedSecurities: {
    nodes: FollowedSecurity[]
  }
}
