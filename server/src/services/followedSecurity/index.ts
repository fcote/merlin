import {
  FollowedSecurityFields,
  FollowedSecurityFilters,
} from '@resolvers/followedSecurity/followedSecurity.inputs'
import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { FollowedSecurityFindMethod } from '@services/followedSecurity/find'
import { FollowedSecurityFindRelationsMethod } from '@services/followedSecurity/findRelations'
import { FollowedSecurityLinkMethod } from '@services/followedSecurity/link'
import { FollowedSecurityUnlinkMethod } from '@services/followedSecurity/unlink'
import { Service } from '@services/service'

class FollowedSecurityService extends Service {
  find = async (
    filters?: FollowedSecurityFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) => new FollowedSecurityFindMethod(this).run(filters, paginate, orderBy)
  findRelations = (
    relationKey: string,
    keys: (string | number)[],
    filters?: FollowedSecurityFilters,
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ) =>
    new FollowedSecurityFindRelationsMethod(this).run(
      relationKey,
      keys,
      filters,
      paginate,
      orderBy
    )

  link = async (inputs: FollowedSecurityFields) =>
    new FollowedSecurityLinkMethod(this).run(inputs)
  unlink = async (inputs: FollowedSecurityFields) =>
    new FollowedSecurityUnlinkMethod(this).run(inputs)
}

export { FollowedSecurityService }
