import Dataloader from 'dataloader'

import {
  paginatedRelationLoader,
  FindKey,
} from '@helpers/paginatedRelationLoader'
import { Company } from '@models/company'
import { FinancialPerformance } from '@models/financial'
import { FinancialItem } from '@models/financialItem'
import { FollowedSecurity } from '@models/followedSecurity'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { Industry } from '@models/industry'
import { Sector } from '@models/sector'
import { Security } from '@models/security'
import { UserAccount } from '@models/userAccount'
import { UserTransaction } from '@models/userTransaction'
import { FollowedSecurityFilters } from '@resolvers/followedSecurity/followedSecurity.inputs'
import { Paginated } from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { UserTransactionFilters } from '@resolvers/userTransaction/userTransaction.inputs'
import { FinancialService } from '@services/financial'
import { FollowedSecurityService } from '@services/followedSecurity'
import { SecurityService } from '@services/security'
import { UserAccountService } from '@services/userAccount'
import { UserTransactionService } from '@services/userTransaction'
import { RequestContext } from '@typings/context'

type UserTransactionsKey = FindKey<UserTransactionFilters> & { userId: string }
type UserAccountsKey = FindKey<UserAccountFilters> & { userId: string }
type FollowedSecuritiesKey = FindKey<FollowedSecurityFilters> & {
  followedSecurityGroupId: number | string
}

class DataloaderService {
  constructor(public ctx: RequestContext) {}

  securityFollowedIn: Dataloader<
    number | string,
    'account' | 'watchlist' | undefined | null
  > = new Dataloader((ids: readonly (number | string)[]) =>
    new SecurityService(this.ctx).attributes.followedIn(ids)
  )

  userTransactions: Dataloader<
    UserTransactionsKey,
    Paginated<UserTransaction> | undefined
  > = new Dataloader(async (keys: readonly UserTransactionsKey[]) => {
    return paginatedRelationLoader(
      'userId',
      keys,
      new UserTransactionService(this.ctx).findRelations
    )
  })
  userAccounts: Dataloader<
    UserAccountsKey,
    Paginated<UserAccount> | undefined
  > = new Dataloader((keys: readonly UserAccountsKey[]) => {
    return paginatedRelationLoader(
      'userId',
      keys,
      new UserAccountService(this.ctx).findRelations
    )
  })

  userAccountSecuritySecurity: Dataloader<
    number | string,
    Security | undefined
  > = new Dataloader((ids: readonly (number | string)[]) =>
    Security.findByIds(ids, true, this.ctx.trx)
  )

  companySector: Dataloader<number | string, Sector | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Sector.findByIds(ids, true, this.ctx.trx)
    )
  companyIndustry: Dataloader<number | string, Industry | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Industry.findByIds(ids, true, this.ctx.trx)
    )

  securityCompany: Dataloader<number | string, Company | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Company.findByIds(ids, true, this.ctx.trx)
    )

  financialSecurity: Dataloader<number | string, Security | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Security.findByIds(ids, true, this.ctx.trx)
    )
  financialFinancialItem: Dataloader<
    number | string,
    FinancialItem | undefined
  > = new Dataloader((ids: readonly (number | string)[]) =>
    FinancialItem.findByIds(ids, true, this.ctx.trx)
  )
  financialPerformance: Dataloader<
    number | string,
    FinancialPerformance | undefined
  > = new Dataloader((ids: readonly (number | string)[]) =>
    new FinancialService(this.ctx).attributes.performance(ids)
  )

  earningSecurity: Dataloader<number | string, Security | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Security.findByIds(ids, true, this.ctx.trx)
    )

  followedSecurityGroupFollowedSecurities: Dataloader<
    FollowedSecuritiesKey,
    Paginated<FollowedSecurity> | undefined
  > = new Dataloader((keys: readonly FollowedSecuritiesKey[]) => {
    return paginatedRelationLoader(
      'followedSecurityGroupId',
      keys,
      new FollowedSecurityService(this.ctx).findRelations
    )
  })

  followedSecuritySecurity: Dataloader<number | string, Security | undefined> =
    new Dataloader((ids: readonly (number | string)[]) =>
      Security.findByIds(ids, true, this.ctx.trx)
    )
  followedSecurityFollowedSecurityGroup: Dataloader<
    number | string,
    FollowedSecurityGroup | undefined
  > = new Dataloader((ids: readonly (number | string)[]) =>
    FollowedSecurityGroup.findByIds(ids, true, this.ctx.trx)
  )
}

export {
  DataloaderService,
  FollowedSecuritiesKey,
  UserAccountsKey,
  UserTransactionsKey,
}
