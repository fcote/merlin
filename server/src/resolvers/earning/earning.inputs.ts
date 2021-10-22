import { GraphQLLocalDate } from 'graphql-scalars'
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
  @Field((_) => String, { nullable: true })
  ticker?: string
  @Field((_) => GraphQLLocalDate, { nullable: true })
  fromDate?: Date
  @Field((_) => GraphQLLocalDate, { nullable: true })
  toDate?: Date

  userId?: string
}

export { EarningFilters, EarningCallTranscriptFields }
