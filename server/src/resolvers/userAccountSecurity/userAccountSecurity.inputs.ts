import { GraphQLDateTime } from 'graphql-iso-date'
import { Field, InputType, ID, Float } from 'type-graphql'

@InputType('UserAccountSecurityFilters')
class UserAccountSecurityFilters {
  @Field((_) => String, { nullable: true })
  accountId?: string
  @Field((_) => String, { nullable: true })
  ticker?: string
  userId?: string
}

@InputType('UserAccountSecurityFields')
class UserAccountSecurityFields {
  @Field((_) => ID, { nullable: true })
  id: number | string
  @Field((_) => String, { nullable: true })
  name: string
  @Field((_) => Float, { nullable: true })
  volume: number
  @Field((_) => Float, { nullable: true })
  openPrice: number
  @Field((_) => String, { nullable: true })
  openedAt: Date
  @Field((_) => String, { nullable: true })
  currency: string
  @Field((_) => ID, { nullable: true })
  securityId: number | string
  @Field((_) => String, { nullable: true })
  securityTicker: string
  @Field((_) => ID, { nullable: true })
  userAccountId: number | string
  @Field((_) => GraphQLDateTime, { nullable: true })
  deletedAt: Date
}

export { UserAccountSecurityFilters, UserAccountSecurityFields }
