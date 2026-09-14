import { UserService } from '@services/user'
import { RequestContext } from '@typings/context'

class SelfUserQueryResolver {
  async user(ctx: RequestContext) {
    return new UserService(ctx).findOne({ userId: ctx.user?.id })
  }
}

export { SelfUserQueryResolver }
