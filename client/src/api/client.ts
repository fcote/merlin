import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { notification } from 'antd'
import { sha256 } from 'crypto-hash'
import Cookies from 'js-cookie'

import getEndpoint from '@helpers/getEndpoint'
import getWsEndpoint from '@helpers/getWsEndpoint'

const httpLink = createPersistedQueryLink({
  useGETForHashedQueries: true,
  sha256,
}).concat(
  createHttpLink({
    uri: getEndpoint('/graphql'),
  })
)

const wsLink = new WebSocketLink({
  uri: getWsEndpoint('/graphql/subscriptions'),
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => {
      const { apiToken } = Cookies.get()
      if (!apiToken) return {}
      return { 'x-api-token': apiToken }
    },
  },
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      notification.error({
        message,
        placement: 'bottomRight',
      })
    })
  }

  if (networkError) {
    notification.error({
      message: networkError.message,
      placement: 'bottomRight',
    })
  }
})

const authLink = setContext((_, { headers }) => {
  const { apiToken } = Cookies.get()
  return {
    headers: {
      ...headers,
      ...(apiToken && { 'x-api-token': apiToken }),
    },
  }
})

const client = new ApolloClient({
  name: 'merlin-client',
  link: authLink.concat(errorLink).concat(splitLink),
  cache: new InMemoryCache({
    typePolicies: {
      SelfQuery: {
        queryType: true,
      },
      SelfMutation: {
        mutationType: true,
      },
    },
  }),
})

export default client
