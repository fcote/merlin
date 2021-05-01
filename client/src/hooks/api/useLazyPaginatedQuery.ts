import { OperationVariables } from '@apollo/client/core'
import {
  QueryHookOptions,
  QueryLazyOptions,
  LazyQueryResult,
} from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'

import useLazyQuery from '@hooks/api/useLazyQuery'

import Paginated from '@lib/paginated'

const useLazyPaginatedQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<Paginated<TData>, TVariables> & {
    namespace?: string
  }
) => {
  const [request, { data: rawData, ...rest }] = useLazyQuery<
    Paginated<TData>,
    TVariables
  >(query, options)

  return [
    request,
    {
      ...rest,
      data: rawData?.nodes ?? [],
      total: rawData?.total ?? 0,
    },
  ] as [
    (options?: QueryLazyOptions<TVariables>) => Promise<Paginated<TData>>,
    LazyQueryResult<TData[], TVariables> & { total: number }
  ]
}

export default useLazyPaginatedQuery
