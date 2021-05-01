import { gql } from '@apollo/client'

import userFragment from '@api/_fragments/user'
import userAccountFragment from '@api/_fragments/userAccount'
import userAccountSecurityFragment from '@api/_fragments/userAccountSecurity'
import userMonthlyExpenses from '@api/_fragments/userMonthlyExpenses'
import userTransaction from '@api/_fragments/userTransaction'

import User from '@lib/user'
import UserAccount from '@lib/userAccount'
import UserAccountSecurity from '@lib/userAccountSecurity'
import UserMonthlyExpenses from '@lib/userMonthlyExpenses'
import { UserMonthlyForecast } from '@lib/userMonthlyForecast'
import UserTransaction from '@lib/userTransaction'

export type SelfHomeQueryResponse = User & {
  monthlyExpenses: UserMonthlyExpenses
  monthlyForecast: UserMonthlyForecast
  punctualTransactions: {
    nodes: UserTransaction[]
  }
  monthlyExpenseTransactions: {
    nodes: UserTransaction[]
  }
  accounts: {
    nodes: UserAccount[]
  }
  accountSecurities: {
    nodes: UserAccountSecurity[]
  }
}

const selfHomeQuery = gql`
  query getHome {
    self {
      user {
        ...UserFragment
        punctualTransactions: transactions(
          filters: { frequencies: [punctual] }
        ) {
          nodes {
            ...UserTransactionFragment
          }
        }
        monthlyExpenseTransactions: transactions(
          filters: { frequencies: [monthly], types: [expense] }
        ) {
          nodes {
            ...UserTransactionFragment
          }
        }
        accounts(orderBy: [{ field: "type", direction: "asc" }]) {
          nodes {
            ...UserAccountFragment
          }
        }
        accountSecurities(orderBy: [{ field: "name", direction: "asc" }]) {
          nodes {
            ...UserAccountSecurityFragment
          }
        }
        monthlyExpenses {
          ...UserMonthlyExpensesFragment
        }
        monthlyForecast(nMonth: 12)
      }
    }
  }
  ${userFragment}
  ${userMonthlyExpenses}
  ${userAccountFragment}
  ${userAccountSecurityFragment}
  ${userTransaction}
`

export default selfHomeQuery
