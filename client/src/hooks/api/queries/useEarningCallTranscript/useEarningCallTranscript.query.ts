import { gql } from '@apollo/client'

const useEarningCallTranscriptQuery = gql`
  query getEarningCallTranscript($earningId: ID!) {
    earningCallTranscript(earningId: $earningId) {
      speaker
      statement
    }
  }
`

export default useEarningCallTranscriptQuery
