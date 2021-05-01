import { gql } from '@apollo/client'

import Paginated from '@lib/paginated'
import StdLog from '@lib/stdLog'

export type LogsResponse = {
  stdLogs: Paginated<StdLog>
}

const useLogsQuery = gql`
  query getLogs {
    stdLogs(
      paginate: { limit: 50, offset: 0 }
      orderBy: [{ field: "createdAt", direction: "desc" }]
    ) {
      total
      nodes {
        id
        message
        level
        data
        createdAt
      }
    }
  }
`

export default useLogsQuery
