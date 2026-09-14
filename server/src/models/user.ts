import { random } from 'lodash'
import { JSONSchema, QueryContext, Model } from 'objection'
import { v4 } from 'uuid'

import { pbkdf2 } from '@helpers/pbkdf2'
import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { unique } from '@models/base/validationMethods'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'

class UserMonthlyExpenses {
  total: number

  left: number

  groceries: number

  subscription: number

  rent: number

  extra: number
}

class User extends SoftDeleteModel {
  id: string

  username: string

  incomePerYear: number

  incomeTaxRate: number

  salaryChargeRate: number

  currency: string

  passwordPbkdf2: string
  passwordSalt: string
  pbkdf2Iterations: number
  apiToken: string

  followedSecurityGroups: FollowedSecurityGroup[]

  static get tableName() {
    return 'users'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: [
      'username',
      'passwordPbkdf2',
      'passwordSalt',
      'pbkdf2Iterations',
    ],
  }

  static get relationMappings() {
    return {
      trackers: {
        relation: Model.HasManyRelation,
        modelClass: FollowedSecurityGroup,
        join: {
          from: `${this.tableName}.id`,
          to: `${FollowedSecurityGroup.tableName}.id`,
        },
      },
    }
  }

  static minIterations: number = 500
  static maxIterations: number = 1000

  static generateSalt = (): string => {
    return v4()
  }

  static generateIterations = (): number => {
    return random(User.minIterations, User.maxIterations)
  }

  static hashPassword = (
    password: string,
    salt: string,
    iterations: number
  ): Promise<string> => {
    return pbkdf2(password, salt, iterations, 64, 'sha1')
  }

  get incomePerMonthBeforeTaxes() {
    return Math.round(
      (this.incomePerYear / 12.0) * (1 - this.salaryChargeRate / 100)
    )
  }

  get netIncomePerMonth() {
    return Math.round(
      this.incomePerMonthBeforeTaxes * (1 - this.incomeTaxRate / 100)
    )
  }

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([unique(this, ['username'], queryContext.transaction)])

    return super.$beforeInsert(queryContext)
  }
}

export { User, UserMonthlyExpenses }
