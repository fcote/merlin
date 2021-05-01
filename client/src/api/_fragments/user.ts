import { gql } from '@apollo/client'

const userFragment = gql`
  fragment UserFragment on User {
    id
    username
    currency
    incomePerYear
    incomeTaxRate
    incomePerMonthBeforeTaxes
    salaryChargeRate
    accountTotalBalance
    netIncomePerMonth
  }
`

export default userFragment
