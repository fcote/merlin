import { uniqBy } from 'lodash'
import pmap from 'p-map'

import { Security } from '@models/security'
import { UserAccount, UserAccountProviderClass } from '@models/userAccount'
import { UserAccountSecurity } from '@models/userAccountSecurity'
import { UserAccountSyncFields } from '@resolvers/userAccount/userAccount.inputs'
import { SecurityService } from '@services/security'
import { ServiceMethod } from '@services/service'
import {
  ApolloResourceNotFound,
  ApolloUnprocessableEntity,
} from '@typings/errors/apolloErrors'

class UserAccountSyncMethod extends ServiceMethod {
  run = async (inputs: UserAccountSyncFields) => {
    const account = await UserAccount.query(this.trx).findById(inputs.id)
    if (!account) {
      throw new ApolloResourceNotFound('USER_ACCOUNT_NOT_FOUND')
    }
    if (!account.provider) {
      throw new ApolloUnprocessableEntity('USER_ACCOUNT_HAS_NO_PROVIDER')
    }

    const providerClass = UserAccountProviderClass[account.provider]
    const provider = new providerClass(
      inputs.id,
      inputs.username,
      inputs.password,
      this.ctx
    )

    // Retrieve provider data
    const balance = await provider.getBalance()
    const securities = await provider.getAccountSecurities()
    // Close provider connection
    provider.close()

    // Update balance
    if (balance) {
      await account.$query(this.trx).patch({ balance })
    }

    if (!securities?.length) {
      return this.done(inputs.id)
    }

    // Update account securities
    await this.syncSecurities(securities)

    // Clear old account securities
    await UserAccountSecurity.query(this.trx)
      .withArchived(true)
      .where('userAccountId', inputs.id)
      .delete()

    // Insert new account securities
    await UserAccountSecurity.query(this.trx)
      .withArchived(true)
      .insertGraph(securities)

    return this.done(inputs.id)
  }

  private syncSecurities = async (
    accountSecurities: Partial<UserAccountSecurity>[]
  ) => {
    const getTradeTicker = (trade: Partial<UserAccountSecurity>) =>
      trade.name.split('.').shift()

    const existingSecurities = await Security.query(this.ctx.trx)
      .select('id', 'ticker')
      .whereIn('ticker', accountSecurities.map(getTradeTicker))

    const securityService = new SecurityService(this.ctx)
    const missingSecurities = uniqBy(
      accountSecurities.filter(
        (t) => !existingSecurities.find((s) => s.ticker === getTradeTicker(t))
      ),
      (t) => t.name
    )
    const missingSecurityInputs = missingSecurities
      .map((t) => ({
        ticker: getTradeTicker(t),
      }))
      .filter((i) => i.ticker)
    await pmap(missingSecurityInputs, securityService.sync, { concurrency: 1 })

    const updatedSecurities = await Security.query(this.ctx.trx)
      .select('id', 'ticker')
      .whereIn('ticker', accountSecurities.map(getTradeTicker))

    accountSecurities.forEach(
      (as) =>
        (as.securityId = updatedSecurities.find(
          (s) => s.ticker === getTradeTicker(as)
        )?.id)
    )
  }

  private done = (accountId: number | string) => {
    return UserAccount.query(this.trx)
      .findById(accountId)
      .withGraphFetched('userAccountSecurities')
  }
}

export { UserAccountSyncMethod }
