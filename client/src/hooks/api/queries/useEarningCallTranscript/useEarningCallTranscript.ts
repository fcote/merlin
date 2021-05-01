import useEarningCallTranscriptQuery from '@hooks/api/queries/useEarningCallTranscript/useEarningCallTranscript.query'
import useLazyQuery from '@hooks/api/useLazyQuery'

import { EarningStatement } from '@lib/earning'

const useEarningCallTranscript = () => {
  const [getEarningCallTranscript, { data, ...rest }] = useLazyQuery<
    EarningStatement[],
    { earningId: number | string }
  >(useEarningCallTranscriptQuery, { fetchPolicy: 'network-only' })

  return { ...rest, getEarningCallTranscript, earningCallTranscript: data }
}

export { useEarningCallTranscript }
