import { InputType, Field } from 'type-graphql'

import { SecurityCompanyOverviewResult } from '@links/types'

@InputType('CompanySyncInputs')
class CompanySyncFields {
  @Field((_) => String, { nullable: true })
  ticker?: string

  overview?: SecurityCompanyOverviewResult
}

export { CompanySyncFields }
