import Dataloader from 'dataloader'
import { groupBy, omit, get } from 'lodash'
import objectHash from 'object-hash'
import pmap from 'p-map'

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
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { UserAccountFilters } from '@resolvers/userAccount/userAccount.inputs'
import { UserTransactionFilters } from '@resolvers/userTransaction/userTransaction.inputs'
import { FinancialService } from '@services/financial'
import { FollowedSecurityService } from '@services/followedSecurity'
import { UserAccountService } from '@services/userAccount'
import { UserTransactionService } from '@services/userTransaction'
import { RequestContext } from '@typings/context'

type FindKey<T> = {
  filters: T
  paginate: PaginationOptions
  orderBy: OrderOptions[]
}

type UserTransactionsKey = FindKey<UserTransactionFilters> & { userId: string }
type UserAccountsKey = FindKey<UserAccountFilters> & { userId: string }
type FollowedSecuritiesKey = FindKey<FollowedSecurityFilters> & {
  followedSecurityGroupId: number | string
}

type FindRelationMethod<FT, RT> = (
  groupKey: string,
  keys: (number | string)[],
  filters: FT,
  paginate: PaginationOptions,
  orderBy: OrderOptions[]
) => Promise<RT[]>

const paginatedRelationLoader = async <FT, RT>(
  relationKey: string,
  keys: FindKey<FT>[],
  serviceMethod: FindRelationMethod<FT, RT>
) => {
  const hashedKeys = keys.map((k) => ({
    ...k,
    hash: objectHash(omit(k, relationKey)),
  }))
  const keyGroups = groupBy(hashedKeys, (hk) => hk.hash)
  const results = await pmap(
    Object.entries(keyGroups),
    async ([hash, keyValues]) => {
      const relationIds = keyValues.map((k) => get(k, relationKey))
      const [{ filters, paginate, orderBy }] = keyValues
      const response = await serviceMethod(
        relationKey,
        relationIds,
        filters,
        paginate,
        orderBy
      )
      return { response, hash }
    },
    { concurrency: 5 }
  )
  return hashedKeys.map((hk) => {
    const keyIndex = keyGroups[hk.hash].findIndex(
      (k) => get(k, relationKey) === get(hk, relationKey)
    )
    return results.find((r) => r.hash === hk.hash)?.response[keyIndex]
  })
}

class DataloaderService {
  constructor(public ctx: RequestContext) {}

  userTransactions: Dataloader<
    UserTransactionsKey,
    Paginated<UserTransaction>
  > = new Dataloader(async (keys: UserTransactionsKey[]) => {
    return paginatedRelationLoader(
      'userId',
      keys,
      new UserTransactionService(this.ctx).findRelations
    )
  })
  userAccounts: Dataloader<
    UserAccountsKey,
    Paginated<UserAccount>
  > = new Dataloader((keys: UserAccountsKey[]) => {
    return paginatedRelationLoader(
      'userId',
      keys,
      new UserAccountService(this.ctx).findRelations
    )
  })

  userAccountSecuritySecurity: Dataloader<
    number | string,
    Security
  > = new Dataloader((ids: (number | string)[]) =>
    Security.findByIds(ids, true, this.ctx.trx)
  )

  companySector: Dataloader<
    number | string,
    Sector
  > = new Dataloader((ids: (number | string)[]) =>
    Sector.findByIds(ids, true, this.ctx.trx)
  )
  companyIndustry: Dataloader<
    number | string,
    Industry
  > = new Dataloader((ids: (number | string)[]) =>
    Industry.findByIds(ids, true, this.ctx.trx)
  )

  securityCompany: Dataloader<
    number | string,
    Company
  > = new Dataloader((ids: (number | string)[]) =>
    Company.findByIds(ids, true, this.ctx.trx)
  )

  financialSecurity: Dataloader<
    number | string,
    Security
  > = new Dataloader((ids: (number | string)[]) =>
    Security.findByIds(ids, true, this.ctx.trx)
  )
  financialFinancialItem: Dataloader<
    number | string,
    FinancialItem
  > = new Dataloader((ids: (number | string)[]) =>
    FinancialItem.findByIds(ids, true, this.ctx.trx)
  )
  financialPerformance: Dataloader<
    number | string,
    FinancialPerformance
  > = new Dataloader((ids: (number | string)[]) =>
    new FinancialService(this.ctx).attributes.performance(ids)
  )

  followedSecurityGroupFollowedSecurities: Dataloader<
    FollowedSecuritiesKey,
    Paginated<FollowedSecurity>
  > = new Dataloader((keys: FollowedSecuritiesKey[]) => {
    return paginatedRelationLoader(
      'followedSecurityGroupId',
      keys,
      new FollowedSecurityService(this.ctx).findRelations
    )
  })

  followedSecuritySecurity: Dataloader<
    number | string,
    Security
  > = new Dataloader((ids: (number | string)[]) =>
    Security.findByIds(ids, true, this.ctx.trx)
  )
  followedSecurityFollowedSecurityGroup: Dataloader<
    number | string,
    FollowedSecurityGroup
  > = new Dataloader((ids: (number | string)[]) =>
    FollowedSecurityGroup.findByIds(ids, true, this.ctx.trx)
  )
}

export { DataloaderService }
