import { AuthChecker } from 'type-graphql'

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

export { authChecker, Right }
