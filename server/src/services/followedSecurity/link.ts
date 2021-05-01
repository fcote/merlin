import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityFields } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { ServiceMethod } from '@services/service'

class FollowedSecurityLinkMethod extends ServiceMethod {
  run = async ({
    alias,
    index,
    followedSecurityGroupId,
    securityId,
  }: FollowedSecurityFields) => {
    const followedSecurity = await FollowedSecurity.query(this.trx)
      .withArchived(true)
      .where({
        followedSecurityGroupId,
        securityId,
      })
      .first()

    return FollowedSecurity.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch({
        ...(followedSecurity && { id: followedSecurity.id }),
        alias,
        index,
        followedSecurityGroupId,
        securityId,
      })
  }
}

export { FollowedSecurityLinkMethod }
