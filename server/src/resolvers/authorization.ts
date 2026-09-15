import type { GraphQLFieldResolver } from 'graphql'

import { UserService } from '@services/user'
import { RequestContext } from '@typings/context'
import { ApolloForbidden } from '@typings/errors/apolloErrors'

type FieldResolver = GraphQLFieldResolver<any, RequestContext>

// Run before protected queries, mutations, and subscription registration.
const authenticated =
  (resolve: FieldResolver): FieldResolver =>
  async (source, args, context, info) => {
    if (!context.userToken) throw new ApolloForbidden('ACCESS_DENIED')
    const user = await new UserService(context).findOne({
      apiToken: context.userToken,
    })
    if (!user) throw new ApolloForbidden('ACCESS_DENIED')
    context.user = user
    return resolve(source, args, context, info)
  }

export { authenticated }
