import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import {
  UserAccountSecurityFilters,
  UserAccountSecurityFields,
} from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { Service } from '@services/service'
import { UserAccountSecurityFindMethod } from '@services/userAccountSecurity/find'
import { UserAccountSecurityUpsertMethod } from '@services/userAccountSecurity/upsert'

import { UserAccountSecurityLinkMethod } from './link'

class UserAccountSecurityService extends Service {
  find = async (
    filters: UserAccountSecurityFilters,
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ) => new UserAccountSecurityFindMethod(this).run(filters, paginate, orderBy)

  link = async (
    userAccountSecurityId: string | number,
    securityId: string | number
  ) =>
    new UserAccountSecurityLinkMethod(this).run(
      userAccountSecurityId,
      securityId
    )
  upsert = async (inputs: UserAccountSecurityFields) =>
    new UserAccountSecurityUpsertMethod(this).run(inputs)
}

export { UserAccountSecurityService }
