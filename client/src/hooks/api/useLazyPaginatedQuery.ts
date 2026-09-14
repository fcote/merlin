import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { useLazyQuery as useApolloLazyQuery } from '@apollo/client/react'
import { DocumentNode } from 'graphql'

import useLazyQuery from '@hooks/api/useLazyQuery'
import Paginated from '@lib/paginated'

const useLazyPaginatedQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: useApolloLazyQuery.Options<Paginated<TData>, TVariables> & {
    namespace?: string
  }
) => {
  const [request, { data, ...rest }] = useLazyQuery<
    Paginated<TData>,
    TVariables
  >(query, options)
  return [
    request,
    { ...rest, data: data?.nodes ?? [], total: data?.total ?? 0 },
  ] as const
}

export default useLazyPaginatedQuery
