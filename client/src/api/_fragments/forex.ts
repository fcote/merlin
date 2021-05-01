import { gql } from '@apollo/client'

const forex = gql`
  fragment ForexFragment on Forex {
    id
    fromCurrency
    toCurrency
    exchangeRate
  }
`

export default forex
