import { FollowedSecurityGroupFields } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import {
  FollowedSecurityGroupFilters,
  FollowedSecurityGroupFindMethod,
} from '@services/followedSecurityGroup/find'
import { FollowedSecurityGroupUpsertMethod } from '@services/followedSecurityGroup/upsert'
import { Service } from '@services/service'

class FollowedSecurityGroupService extends Service {
  upsert = async (inputs: FollowedSecurityGroupFields) =>
    new FollowedSecurityGroupUpsertMethod(this).run(inputs)
  find = async (
    filters?: FollowedSecurityGroupFilters,
    pagination?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) =>
    new FollowedSecurityGroupFindMethod(this).run(filters, pagination, orderBy)
}

export { FollowedSecurityGroupService }
