import { JSONSchema } from 'objection'
import { ObjectType, Field, Float } from 'type-graphql'

import { BaseModel } from '@models/base'
import { PaginatedClass } from '@resolvers/paginated'

@ObjectType('Forex')
class Forex extends BaseModel {
  @Field((_) => String)
  fromCurrency: string
  @Field((_) => String)
  toCurrency: string
  @Field((_) => Float)
  exchangeRate: number

  static get tableName() {
    return 'forex'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['fromCurrency', 'toCurrency', 'exchangeRate'],
  }
}

@ObjectType('PaginatedForex')
class PaginatedForex extends PaginatedClass(Forex) {}

export { Forex, PaginatedForex }
