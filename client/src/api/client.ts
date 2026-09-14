import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
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
    headers: { 'Apollo-Require-Preflight': 'true' },
  })
)

export const wsClient = createClient({
  url: getWsEndpoint('/graphql/subscriptions'),

  lazy: true,
  connectionParams: () => {
    const { apiToken } = Cookies.get()
    if (!apiToken) return {}
    return { 'x-api-token': apiToken }
  },
})
const wsLink = new GraphQLWsLink(wsClient)

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

const errorLink = onError(({ error }) => {
  const errors = CombinedGraphQLErrors.is(error) ? error.errors : [error]
  errors.forEach(({ message }) =>
    notification.error({ message, placement: 'bottomRight' })
  )
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
  clientAwareness: { name: 'merlin-client' },
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
