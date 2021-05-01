import {
  Arg,
  Ctx,
  Resolver,
  Mutation,
  ObjectType,
  Field,
  Authorized,
  FieldResolver,
} from 'type-graphql'

import { config } from '@config'
import { User } from '@models/user'
import { Right } from '@resolvers'
import { SelfMutation } from '@resolvers/root'
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

@ObjectType()
class AuthResponse {
  @Field((_) => String)
  id: string
  @Field((_) => String)
  username: string
  @Field((_) => String)
  apiToken: string
}

@Resolver()
class UserMutationResolver {
  @Mutation((_) => AuthResponse)
  async userSignUp(
    @Arg('inputs', (_) => SignUpFields) { username, password }: SignUpFields,
    @Ctx() ctx: RequestContext
  ): Promise<Partial<AuthResponse>> {
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

  @Mutation((_) => AuthResponse)
  async userSignIn(
    @Arg('inputs', (_) => SignInFields) { username, password }: SignInFields,
    @Ctx() ctx: RequestContext
  ): Promise<AuthResponse> {
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

@Resolver(SelfMutation)
class SelfUserMutationResolver {
  @Authorized([Right.authenticated])
  @FieldResolver((_) => User)
  async updateUser(
    @Arg('inputs', (_) => UserFields) inputs: UserFields,
    @Ctx() ctx: RequestContext
  ): Promise<User> {
    return new UserService(ctx).update({ ...inputs, id: ctx.user.id })
  }
}

export { UserMutationResolver, SelfUserMutationResolver }
