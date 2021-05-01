import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { UserAccountSecurityFilters } from '@resolvers/userAccountSecurity/userAccountSecurity.inputs'
import { Service } from '@services/service'
import { UserAccountSecurityFindMethod } from '@services/userAccountSecurity/find'

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
}

export { UserAccountSecurityService }
