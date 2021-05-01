import { InputType, Field } from 'type-graphql'

@InputType('ForexCurrencyPair')
class ForexCurrencyPair {
  @Field((_) => String)
  fromCurrency: string
  @Field((_) => String)
  toCurrency: string
}

@InputType('ForexFilters')
class ForexFilters {
  @Field((_) => [ForexCurrencyPair])
  currencyPairs: ForexCurrencyPair[]
}

export { ForexFilters, ForexCurrencyPair }
