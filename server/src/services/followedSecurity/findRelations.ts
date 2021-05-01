import {
  PaginatedFollowedSecurity,
  FollowedSecurity,
} from '@models/followedSecurity'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FollowedSecurityFindMethod } from '@services/followedSecurity/find'
import { ServiceMethod } from '@services/service'

class FollowedSecurityFindRelationsMethod extends ServiceMethod {
  run = async (
    groupBy: string,
    keys: (string | number)[],
    filters: FollowedSecurityFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<PaginatedFollowedSecurity[]> => {
    return FollowedSecurity.paginateRelation(
      FollowedSecurityFindMethod.applyFilters(
        FollowedSecurity.query(this.trx),
        filters
      ),
      paginate,
      orderBy,
      groupBy,
      keys
    )
  }
}

export { FollowedSecurityFindRelationsMethod }
