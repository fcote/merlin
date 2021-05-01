import { User } from '@models/user'
import { ServiceMethod } from '@services/service'

class UserCreateMethod extends ServiceMethod {
  run = async (username: string, password: string) => {
    const salt = User.generateSalt()
    const iterations = User.generateIterations()
    const passwordHash = await User.hashPassword(password, salt, iterations)

    return User.query(this.trx).insertAndFetch({
      username,
      passwordPbkdf2: passwordHash,
      pbkdf2Iterations: iterations,
      passwordSalt: salt,
    })
  }
}

export { UserCreateMethod }
