import { Mutation, ObjectType, Query, Resolver } from 'type-graphql'

@ObjectType('SelfQuery')
class SelfQuery {}

@ObjectType('SelfMutation')
class SelfMutation {}

@Resolver(SelfQuery)
class SelfQueryResolver {
  @Query((_) => SelfQuery)
  async self() {
    return {}
  }
}

@Resolver(SelfMutation)
class SelfMutationResolver {
  @Mutation((_) => SelfMutation)
  async self() {
    return {}
  }
}

export { SelfQueryResolver, SelfMutationResolver, SelfQuery, SelfMutation }
