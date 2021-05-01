import { sumBy } from 'lodash'

import { UserAccount } from '@models/userAccount'
import { ServiceMethod } from '@services/service'

class UserAccountTotalBalanceMethod extends ServiceMethod {
  run = async (userId: string) => {
    const accounts = await UserAccount.query(this.trx).where('userId', userId)
    return sumBy(accounts, (a) => a.balance)
  }
}

export { UserAccountTotalBalanceMethod }
