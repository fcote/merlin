import { OperationVariables } from '@apollo/client/core'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'

import useQuery from '@hooks/api/useQuery'

import Paginated from '@lib/paginated'

const usePaginatedQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables> & {
    namespace?: string
  }
) => {
  const { data: rawData, ...rest } = useQuery<any, TVariables>(query, options)

  const data = rawData as Paginated<TData>

  return {
    data: data?.nodes ?? [],
    total: data?.total ?? 0,
    ...rest,
  }
}

export default usePaginatedQuery
