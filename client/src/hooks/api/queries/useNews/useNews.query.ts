import { gql } from '@apollo/client'

import newsFragment from '@api/_fragments/news'

const useNewsQuery = gql`
  query getNews($filters: NewsFilters!) {
    news(
      filters: $filters
      paginate: { limit: 50, offset: 0 }
      orderBy: [{ field: "date", direction: "desc" }]
    ) {
      nodes {
        ...NewsFragment
      }
    }
  }
  ${newsFragment}
`

export default useNewsQuery
