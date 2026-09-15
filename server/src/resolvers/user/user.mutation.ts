import { config } from '@config'
import { User } from '@models/user'
import {
  SignUpFields,
  SignInFields,
  UserFields,
} from '@resolvers/user/user.inputs'
import { UserService } from '@services/user'
import { RequestContext } from '@typings/context'
import {
  ApolloUnauthorized,
  ApolloBadRequest,
} from '@typings/errors/apolloErrors'

class UserMutationResolver {
  async userSignUp({ username, password }: SignUpFields, ctx: RequestContext) {
    if (!config.get('features.allowUserSignUp')) {
      throw new ApolloUnauthorized('USER_SIGN_UP_NOT_ALLOWED')
    }
    if (!username || !password) {
      throw new ApolloUnauthorized('MISSING_INPUTS')
    }

    const userService = new UserService(ctx)

    const existingUser = await userService.findOne({ username })
    if (existingUser) {
      throw new ApolloBadRequest('USER_ALREADY_EXIST')
    }

    const user = await userService.create(username, password)

    return {
      id: user.id,
      username: user.username,
      apiToken: user.apiToken,
    }
  }

  async userSignIn({ username, password }: SignInFields, ctx: RequestContext) {
    if (!username || !password) {
      throw new ApolloUnauthorized('MISSING_INPUTS')
    }

    const user = await new UserService(ctx).findOne({ username })
    if (!user) {
      throw new ApolloUnauthorized('USER_NOT_FOUND')
    }

    const passwordHash = await User.hashPassword(
      password,
      user.passwordSalt,
      user.pbkdf2Iterations
    )
    if (passwordHash !== user.passwordPbkdf2) {
      throw new ApolloUnauthorized('PASSWORDS_DONT_MATCH')
    }

    return {
      id: user.id,
      username: user.username,
      apiToken: user.apiToken,
    }
  }
}

class SelfUserMutationResolver {
  async updateUser(inputs: UserFields, ctx: RequestContext) {
    return new UserService(ctx).update({ ...inputs, id: ctx.user!.id })
  }
}

export { UserMutationResolver, SelfUserMutationResolver }
