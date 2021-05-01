import { buildSchemaSync, AuthChecker } from 'type-graphql'

import { pubSub } from '@pubSub'
import { UserService } from '@services/user'
import { RequestContext } from '@typings/context'
import { ApolloForbidden } from '@typings/errors/apolloErrors'

enum Right {
  authenticated = 'authenticated',
}

const authChecker: AuthChecker<RequestContext, Right> = async (
  { context },
  rights
) => {
  if (rights.includes(Right.authenticated)) {
    const user = await new UserService(context).findOne({
      apiToken: context.userToken,
    })
    if (!user) throw new ApolloForbidden('ACCESS_DENIED')
    context.user = user
  }

  return true
}

const schema = buildSchemaSync({
  resolvers: [
    `${__dirname}'/../resolvers/**/*.{mutation,query,subscription,fields}.{ts,js}`,
  ],
  authChecker,
  emitSchemaFile: {
    path: './schema.graphql',
  },
  pubSub,
})

export { schema, Right }
