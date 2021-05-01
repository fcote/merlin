import { InputType, Field } from 'type-graphql'

import { FinancialItemType } from '@models/financialItem'

@InputType('FinancialItemFilters')
class FinancialItemFilters {
  @Field((_) => FinancialItemType)
  type?: FinancialItemType
}

export { FinancialItemFilters }
