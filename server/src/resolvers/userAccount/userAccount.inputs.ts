import { GraphQLDateTime } from 'graphql-scalars'
import { InputType, Field, ID, Float } from 'type-graphql'

import { UserAccountType, UserAccountProvider } from '@models/userAccount'

@InputType('UserAccountFilters')
class UserAccountFilters {
  @Field((_) => [UserAccountType])
  types?: UserAccountType[]

  userId?: string
}

@InputType('UserAccountSyncFields')
class UserAccountSyncFields {
  @Field((_) => ID)
  id: number | string
  @Field((_) => String)
  username: string
  @Field((_) => String)
  password: string
}

@InputType('UserAccountFields')
class UserAccountFields {
  @Field((_) => ID, { nullable: true })
  id?: number | string
  @Field((_) => String, { nullable: true })
  name?: string
  @Field((_) => UserAccountType, { nullable: true })
  type?: UserAccountType
  @Field((_) => UserAccountProvider, { nullable: true })
  provider?: UserAccountProvider
  @Field((_) => Float, { nullable: true })
  balance?: number
  @Field((_) => GraphQLDateTime, { nullable: true })
  deletedAt?: Date

  userId?: string
}

export { UserAccountFilters, UserAccountSyncFields, UserAccountFields }
