import { QueryBuilder } from 'objection'

import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class FollowedSecurityFindMethod extends ServiceMethod {
  run = async (
    filters: FollowedSecurityFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<FollowedSecurity>> => {
    return FollowedSecurity.paginate(
      FollowedSecurityFindMethod.applyFilters(
        FollowedSecurity.query(this.trx),
        filters
      ),
      paginate,
      orderBy
    )
  }

  static applyFilters = (
    query: QueryBuilder<FollowedSecurity>,
    filters: FollowedSecurityFilters = {}
  ) => {
    query.joinRelated('security')

    if (filters.indexes) {
      query.whereIn('followed_securities.index', filters.indexes)
    }

    return query
  }
}

export { FollowedSecurityFindMethod }
