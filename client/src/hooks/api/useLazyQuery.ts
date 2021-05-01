import { useLazyQuery as useApolloLazyQuery } from '@apollo/client'
import { OperationVariables } from '@apollo/client/core'
import {
  QueryHookOptions,
  QueryLazyOptions,
  LazyQueryResult,
  Context,
} from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'
import { useRef, useEffect, useCallback, useMemo } from 'react'

import client from '@api/client'

import { queryExtractData } from '@helpers/queryExtractData'

export type LazyQueryExecute<TData, TVariables> = ({
  variables,
  context,
}: {
  variables?: TVariables
  context?: Context
}) => Promise<TData>

const useLazyQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables> & {
    namespace?: string
  }
) => {
  const [baseRequest, { data: rawData, ...rest }] = useApolloLazyQuery<
    any,
    TVariables
  >(query, { ...options, client })

  const resolveRef = useRef<(value?: TData | PromiseLike<TData>) => void>()

  useEffect(() => {
    if (!rest.called || rest.loading || !resolveRef.current) return

    const data = queryExtractData<TData>(rawData, options?.namespace)
    resolveRef.current(data)
    resolveRef.current = undefined
  }, [rest.loading, rest.called])

  // Wrap request in a promise
  const request: LazyQueryExecute<TData, TVariables> = useCallback(
    ({ variables, context }) => {
      baseRequest({ variables, context })
      return new Promise<TData>((resolve) => {
        resolveRef.current = resolve
      })
    },
    [baseRequest]
  )

  // Extract actual data from the response
  const data = useMemo(() => {
    return queryExtractData<TData>(rawData, options?.namespace)
  }, [rawData])

  return [request, { ...rest, data }] as [
    (options?: QueryLazyOptions<TVariables>) => Promise<TData>,
    LazyQueryResult<TData, TVariables>
  ]
}

export default useLazyQuery
