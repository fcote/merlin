import { gql } from '@apollo/client'

const userMonthlyExpensesFragment = gql`
  fragment UserMonthlyExpensesFragment on UserMonthlyExpenses {
    total
    left
    groceries
    subscription
    rent
    extra
  }
`

export default userMonthlyExpensesFragment
