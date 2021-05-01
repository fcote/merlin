import { InputType, Field, Int } from 'type-graphql'

@InputType('EarningCallTranscriptFields')
class EarningCallTranscriptFields {
  @Field((_) => String)
  ticker: string
  @Field((_) => Int)
  fiscalQuarter: number
  @Field((_) => Int)
  fiscalYear: number
}

@InputType('EarningFilters')
class EarningFilters {
  @Field((_) => String)
  ticker: string
}

export { EarningFilters, EarningCallTranscriptFields }
