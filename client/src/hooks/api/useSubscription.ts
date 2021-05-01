import { useSubscription as useApolloSubscription } from '@apollo/client'
import { OperationVariables } from '@apollo/client/core'
import { SubscriptionHookOptions } from '@apollo/client/react/types/types'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DocumentNode } from 'graphql'
import { useMemo } from 'react'

import client from '@api/client'

import { queryExtractData } from '@helpers/queryExtractData'

const useSubscription = <TData = any, TVariables = OperationVariables>(
  subscription: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: SubscriptionHookOptions<TData, TVariables> & {
    namespace?: string
  }
) => {
  const { data: rawData, ...rest } = useApolloSubscription(subscription, {
    ...options,
    client,
  })

  const data = useMemo(() => {
    return queryExtractData<TData>(rawData, options?.namespace)
  }, [rawData])

  return { data, ...rest }
}

export { useSubscription }
