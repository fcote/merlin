import { Ctx, FieldResolver, Resolver, Authorized } from 'type-graphql'

import { User } from '@models/user'
import { Right } from '@resolvers'
import { SelfQuery } from '@resolvers/root'
import { UserService } from '@services/user'
import { RequestContext } from '@typings/context'

@Resolver(SelfQuery)
class SelfUserQueryResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => User)
  async user(@Ctx() ctx: RequestContext): Promise<User> {
    return new UserService(ctx).findOne({ userId: ctx.user.id })
  }
}

export { SelfUserQueryResolver }
