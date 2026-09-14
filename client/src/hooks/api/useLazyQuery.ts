import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { useLazyQuery as useApolloLazyQuery } from '@apollo/client/react'
import { DocumentNode } from 'graphql'
import { useCallback, useMemo } from 'react'

import client from '@api/client'
import { queryExtractData } from '@helpers/queryExtractData'

export type LazyQueryExecute<TData, TVariables extends OperationVariables> = (
  options?: useApolloLazyQuery.ExecOptions<TVariables>
) => Promise<TData>

const useLazyQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: useApolloLazyQuery.Options<TData, TVariables> & {
    namespace?: string
  }
) => {
  const [execute, { data: rawData, ...rest }] = useApolloLazyQuery<
    any,
    TVariables
  >(query, { ...options, client })
  const request = useCallback(
    async (requestOptions?: useApolloLazyQuery.ExecOptions<TVariables>) => {
      const result = await execute(requestOptions)
      return queryExtractData<TData>(result.data, options?.namespace)
    },
    [execute, options?.namespace]
  )
  const data = useMemo(
    () => queryExtractData<TData>(rawData, options?.namespace),
    [rawData, options?.namespace]
  )
  return [request, { ...rest, data }] as const
}

export default useLazyQuery
