import { QueryBuilder } from 'objection'

import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { FollowedSecurityGroupFilters } from '@resolvers/followedSecurityGroup/followedSecurityGroup.inputs'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class FollowedSecurityGroupFindMethod extends ServiceMethod {
  run = async (
    filters: FollowedSecurityGroupFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<FollowedSecurityGroup>> => {
    return FollowedSecurityGroup.paginate(
      this.applyFilters(FollowedSecurityGroup.query(this.trx), filters),
      paginate,
      orderBy
    )
  }

  applyFilters = (
    query: QueryBuilder<FollowedSecurityGroup>,
    filters: FollowedSecurityGroupFilters
  ) => {
    if (filters.userId) {
      query.where('userId', filters.userId)
    }
    if (filters.type) {
      query.where('type', filters.type)
    }
    return query.withGraphFetched('securities.company')
  }
}

export { FollowedSecurityGroupFindMethod, FollowedSecurityGroupFilters }
