import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FollowedSecurityFindMethod } from '@services/followedSecurity/find'
import { ServiceMethod } from '@services/service'

class FollowedSecurityFindRelationsMethod extends ServiceMethod {
  run = async (
    groupBy: string,
    keys: readonly (string | number)[],
    filters?: FollowedSecurityFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) => {
    return FollowedSecurity.paginateRelation(
      FollowedSecurityFindMethod.applyFilters(
        FollowedSecurity.query(this.trx),
        filters
      ),
      groupBy,
      keys,
      paginate,
      orderBy
    )
  }
}

export { FollowedSecurityFindRelationsMethod }
