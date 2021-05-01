import {
  useMutation as useApolloMutation,
  MutationFunctionOptions,
} from '@apollo/client'
import { OperationVariables } from '@apollo/client/core'
import {
  MutationHookOptions,
  MutationResult,
} from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'

import client from '@api/client'

import { queryExtractData } from '@helpers/queryExtractData'

const useMutation = <TData = any, TVariables = OperationVariables>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables> & {
    namespace?: string
  }
) => {
  const [baseRequest, { ...rest }] = useApolloMutation<any, TVariables>(
    mutation,
    { ...options, client }
  )

  const request = async (
    requestOptions: MutationFunctionOptions<TData, TVariables>
  ) => {
    const { data } = await baseRequest(requestOptions)
    return queryExtractData<TData>(data, options?.namespace)
  }

  return [request, { ...rest }] as [
    (options?: MutationFunctionOptions<TData, TVariables>) => Promise<TData>,
    MutationResult<TData>
  ]
}

export default useMutation
