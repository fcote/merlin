import { omit, groupBy, get } from 'lodash'
import objectHash from 'object-hash'
import pmap from 'p-map'

import { PaginationOptions, OrderOptions } from '@resolvers/paginated'

type FindKey<T> = {
  filters: T
  paginate: PaginationOptions
  orderBy: OrderOptions[]
}

type FindRelationMethod<FT, RT> = (
  groupKey: string,
  keys: (number | string)[],
  filters: FT,
  paginate: PaginationOptions,
  orderBy: OrderOptions[]
) => Promise<RT[]>

const paginatedRelationLoader = async <FT, RT>(
  relationKey: string,
  keys: FindKey<FT>[],
  serviceMethod: FindRelationMethod<FT, RT>
) => {
  const hashedKeys = keys.map((k) => ({
    ...k,
    hash: objectHash(omit(k, relationKey)),
  }))
  const keyGroups = groupBy(hashedKeys, (hk) => hk.hash)
  const results = await pmap(
    Object.entries(keyGroups),
    async ([hash, keyValues]) => {
      const relationIds = keyValues.map((k) => get(k, relationKey))
      const [{ filters, paginate, orderBy }] = keyValues
      const response = await serviceMethod(
        relationKey,
        relationIds,
        filters,
        paginate,
        orderBy
      )
      return { response, hash }
    },
    { concurrency: 5 }
  )
  return hashedKeys.map((hk) => {
    const keyIndex = keyGroups[hk.hash].findIndex(
      (k) => get(k, relationKey) === get(hk, relationKey)
    )
    return results.find((r) => r.hash === hk.hash)?.response[keyIndex]
  })
}

export { FindKey, FindRelationMethod, paginatedRelationLoader }
