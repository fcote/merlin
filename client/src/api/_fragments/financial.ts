import { gql } from '@apollo/client'

const financialFragment = gql`
  fragment FinancialFragment on Financial {
    id
    value
    year
    period
    reportDate

    performance {
      grade
      sectorValue
      diffPercent
    }

    financialItemId
  }
`

export default financialFragment
