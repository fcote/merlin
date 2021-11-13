import { QueryBuilder } from 'objection'

import { FollowedSecurityGroupType } from '@models/followedSecurityGroup'
import { Security } from '@models/security'
import { ServiceMethod } from '@services/service'

type FollowedSecurity = Security & {
  userAccountId?: number | string
  followedSecurityGroupId?: number | string
}

class SecurityFollowedInMethod extends ServiceMethod {
  run = async (
    securityIds: readonly (number | string)[]
  ): Promise<('watchlist' | 'account' | null)[]> => {
    const followedSecurityGroupCondition = (q: QueryBuilder<Security>) => {
      return q
        .where(
          'followedSecurities:followedSecurityGroup.userId',
          this.ctx.user!.id
        )
        .where(
          'followedSecurities:followedSecurityGroup.type',
          FollowedSecurityGroupType.watchlist
        )
    }

    const securities = (await Security.query(this.trx)
      .select(
        'securities.id',
        'followedSecurities:followedSecurityGroup.id as followedSecurityGroupId',
        'userAccountSecurities:userAccount.id as userAccountId'
      )
      .leftJoinRelated(
        '[followedSecurities.followedSecurityGroup, userAccountSecurities.userAccount]'
      )
      .where((q) =>
        q
          .where(followedSecurityGroupCondition)
          .orWhere(
            'userAccountSecurities:userAccount.userId',
            this.ctx.user!.id
          )
      )) as FollowedSecurity[]

    return securityIds.map((id) => {
      const security = securities.find((s) => s.id === id)
      if (security?.userAccountId) return 'account'
      if (security?.followedSecurityGroupId) return 'watchlist'
      return null
    })
  }
}

export { SecurityFollowedInMethod }
