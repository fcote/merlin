import { GraphQLDateTime } from 'graphql-iso-date'
import { InputType, Field, ID, Float } from 'type-graphql'

import {
  UserTransactionCategory,
  UserTransactionType,
  UserTransactionFrequency,
} from '@models/userTransaction'

@InputType('UserTransactionFilters')
class UserTransactionFilters {
  @Field((_) => String, { nullable: true })
  limitDate?: string
  @Field((_) => [UserTransactionCategory], { nullable: true })
  categories?: UserTransactionCategory[]
  @Field((_) => [UserTransactionType], { nullable: true })
  types?: UserTransactionType[]
  @Field((_) => [UserTransactionFrequency], { nullable: true })
  frequencies?: UserTransactionFrequency[]

  userId?: string
}

@InputType('UserTransactionFields')
class UserTransactionFields {
  @Field((_) => ID, { nullable: true })
  id?: number | string
  @Field((_) => String, { nullable: true })
  name?: string
  @Field((_) => Float, { nullable: true })
  value?: number
  @Field((_) => UserTransactionCategory, { nullable: true })
  category?: UserTransactionCategory
  @Field((_) => UserTransactionType, { nullable: true })
  type?: UserTransactionType
  @Field((_) => UserTransactionFrequency, { nullable: true })
  frequency?: UserTransactionFrequency
  @Field((_) => String, { nullable: true })
  date?: string
  @Field((_) => GraphQLDateTime, { nullable: true })
  deletedAt?: Date

  userId: string
}

export { UserTransactionFilters, UserTransactionFields }
