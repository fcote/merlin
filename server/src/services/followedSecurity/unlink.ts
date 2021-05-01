import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityFields } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'

class FollowedSecurityUnlinkMethod extends ServiceMethod {
  run = async ({
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
    if (!followedSecurity) {
      throw new ApolloResourceNotFound('FOLLOWED_SECURITY_NOT_FOUND')
    }

    return followedSecurity.$query(this.trx).delete()
  }
}

export { FollowedSecurityUnlinkMethod }
