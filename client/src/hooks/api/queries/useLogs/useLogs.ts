import useLogsQuery from '@hooks/api/queries/useLogs/useLogs.query'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import StdLog from '@lib/stdLog'

const useLogs = () => usePaginatedQuery<StdLog>(useLogsQuery)

export { useLogs }
