import { gql } from '@apollo/client'

const financialItemFragment = gql`
  fragment FinancialItemFragment on FinancialItem {
    id
    slug
    label
    type
    statement
    unit
    unitType
    index
    isMain
    latexDescription
    direction
  }
`

export default financialItemFragment
