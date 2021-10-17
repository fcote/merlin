import { InputType, Field, Int } from 'type-graphql'

import { FinancialFreq } from '@models/financial'
import {
  FinancialItemType,
  FinancialStatement,
  FinancialStatementType,
} from '@models/financialItem'

@InputType('FinancialFindFilters')
class FinancialFilters {
  @Field((_) => String)
  ticker: string
  @Field((_) => Boolean, { defaultValue: false })
  estimate: boolean = false
  @Field((_) => FinancialItemType, { nullable: true })
  type?: FinancialItemType
  @Field((_) => FinancialStatementType, { nullable: true })
  statement?: FinancialStatement
  @Field((_) => FinancialFreq, { nullable: true })
  freq?: FinancialFreq
}

@InputType('FinancialSyncSecurityFields')
class FinancialSyncSecurityFields {
  @Field((_) => String)
  ticker: string
}

@InputType('FinancialPeriodFields')
class FinancialPeriodFields {
  @Field((_) => Int)
  year: number
  @Field((_) => String)
  period: string
}

@InputType('FinancialSyncSectorFields')
class FinancialSyncSectorFields {
  @Field((_) => String)
  name: string
  @Field((_) => [FinancialPeriodFields])
  periods: FinancialPeriodFields[]
}

export {
  FinancialFilters,
  FinancialPeriodFields,
  FinancialSyncSecurityFields,
  FinancialSyncSectorFields,
}
