import { gql } from '@apollo/client'

const historicalPriceFragment = gql`
  fragment HistoricalPriceFragment on HistoricalPrice {
    id
    date
    close
    volume
    change
  }
`

export default historicalPriceFragment
