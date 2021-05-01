import { InputType, Field } from 'type-graphql'

import {
  SecurityCompanyOverviewResult,
  SecurityQuoteResult,
} from '@links/types'

@InputType('SecurityFields')
class SecurityFields {
  @Field((_) => String)
  ticker: string

  companyOverview?: SecurityCompanyOverviewResult
  quote?: SecurityQuoteResult
}

@InputType('SecurityFilters')
class SecurityFilters {
  @Field((_) => String, { nullable: true })
  ticker?: string

  followedSecurityGroupId?: number | string
}

export { SecurityFields, SecurityFilters }
