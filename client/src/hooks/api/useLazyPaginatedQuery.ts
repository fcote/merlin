import {
  ApolloClient,
  NetworkStatus,
  ObservableQuery,
  OperationVariables,
} from '@apollo/client/core'
import { ApolloError } from '@apollo/client/errors'
import {
  QueryHookOptions,
  QueryLazyOptions,
  ObservableQueryFields,
} from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'

import useLazyQuery from '@hooks/api/useLazyQuery'

import Paginated from '@lib/paginated'

export interface PaginatedQueryResult<
  TData = any,
  TVariables = OperationVariables
> extends ObservableQueryFields<Paginated<TData>, TVariables> {
  client: ApolloClient<any>
  observable: ObservableQuery<Paginated<TData>, TVariables>
  data: TData[] | undefined
  previousData?: Paginated<TData>
  error?: ApolloError
  loading: boolean
  networkStatus: NetworkStatus
  called: boolean
}

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
    PaginatedQueryResult<TData, TVariables> & { total: number }
  ]
}

export default useLazyPaginatedQuery
