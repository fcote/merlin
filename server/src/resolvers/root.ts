class SelfQuery {}

class SelfMutation {}

class SelfQueryResolver {
  async self() {
    return {}
  }
}

class SelfMutationResolver {
  async self() {
    return {}
  }
}

export { SelfQueryResolver, SelfMutationResolver, SelfQuery, SelfMutation }
