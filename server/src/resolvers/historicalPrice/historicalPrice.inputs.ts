import { InputType, Field } from 'type-graphql'

@InputType('HistoricalPriceFilters')
class HistoricalPriceFilters {
  @Field((_) => String)
  ticker: string
}

export { HistoricalPriceFilters }
