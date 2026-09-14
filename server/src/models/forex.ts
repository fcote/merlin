import { JSONSchema } from 'objection'

import { BaseModel } from '@models/base'
import { PaginatedClass } from '@resolvers/paginated'

class Forex extends BaseModel {
  fromCurrency: string

  toCurrency: string

  exchangeRate: number

  static get tableName() {
    return 'forex'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['fromCurrency', 'toCurrency', 'exchangeRate'],
  }
}

class PaginatedForex extends PaginatedClass(Forex) {}

export { Forex, PaginatedForex }
