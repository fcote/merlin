import { InputType, Field, Int, Float } from 'type-graphql'

interface UserFilters {
  username?: string
  apiToken?: string
  userId?: string
}

@InputType('SignInFields')
class SignInFields {
  @Field((_) => String)
  username: string
  @Field((_) => String)
  password: string
}

@InputType('SignUpField')
class SignUpFields {
  @Field((_) => String)
  username: string
  @Field((_) => String)
  password: string
}

@InputType('UserFields')
class UserFields {
  @Field((_) => String, { nullable: true })
  username: string
  @Field((_) => String, { nullable: true })
  currency: string
  @Field((_) => Int, { nullable: true })
  incomePerYear: number
  @Field((_) => Float, { nullable: true })
  incomeTaxRate: number
  @Field((_) => Float, { nullable: true })
  salaryChargeRate: number

  id: string
}

export { UserFilters, SignInFields, SignUpFields, UserFields }
