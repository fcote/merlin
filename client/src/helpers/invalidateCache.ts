import { ApolloCache } from '@apollo/client'

import client from '@api/client'

const invalidateCache = (match: string) => {
  const cache = client.cache as ApolloCache<any> & { data: any }
  const rootQuery = cache.data.data.ROOT_QUERY
  Object.keys(rootQuery).forEach((key) => {
    if (key.match(match)) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: key,
      })
    }
  })
}

export { invalidateCache }
