import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityGroupFields } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import { ServiceMethod } from '@services/service'

class FollowedSecurityGroupUpsertMethod extends ServiceMethod {
  run = async (inputs: FollowedSecurityGroupFields) => {
    return FollowedSecurityGroup.query(this.trx)
      .withArchived(true)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
  }
}

export { FollowedSecurityGroupUpsertMethod }
