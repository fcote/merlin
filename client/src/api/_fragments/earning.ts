import { gql } from '@apollo/client'

const earningFragment = gql`
  fragment EarningFragment on Earning {
    id
    date
    fiscalYear
    fiscalQuarter
    time
    epsEstimate
    eps
    epsSurprisePercent
    revenueEstimate
    revenue
    revenueSurprisePercent
    callTranscript {
      speaker
      statement
    }
  }
`

export default earningFragment
