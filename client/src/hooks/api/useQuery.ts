import { useQuery as useApolloQuery } from '@apollo/client'
import { OperationVariables } from '@apollo/client/core'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'
import { useMemo } from 'react'

import client from '@api/client'

import { queryExtractData } from '@helpers/queryExtractData'

const useQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables> & {
    namespace?: string
  }
) => {
  const { data: rawData, refetch: baseRefetch, ...rest } = useApolloQuery<
    any,
    TVariables
  >(query, { ...options, client })

  const refetch = async (variables?: Partial<TVariables>) => {
    const { data } = await baseRefetch(variables)
    return queryExtractData<TData>(data, options?.namespace)
  }

  const data = useMemo(() => {
    return queryExtractData<TData>(rawData, options?.namespace)
  }, [rawData])

  return { data, refetch, ...rest }
}

export default useQuery
