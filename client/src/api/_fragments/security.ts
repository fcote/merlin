import { gql } from '@apollo/client'

const securityFragment = gql`
  fragment SecurityFragment on Security {
    id
    ticker
    currency
    type
    marketStatus
    currentPrice
    dayChange
    dayChangePercent
    weekChange
    weekChangePercent
    extendedHoursPrice
    extendedHoursChangePercent
    high52Week
    low52Week
    marketCapitalization
    sharesOutstanding
    company {
      id
      name
      cik
      isin
      cusip
      sector
      industry
      employees
      address
      description
    }
  }
`

export default securityFragment
