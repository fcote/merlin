import { FinancialFreq } from '@models/financial'
import { FinancialItemType, FinancialStatement } from '@models/financialItem'

class FinancialFilters {
  ticker: string

  estimate: boolean = false

  type?: FinancialItemType

  statement?: FinancialStatement

  freq?: FinancialFreq
}

class FinancialSyncSecurityFields {
  ticker: string
}

class FinancialPeriodFields {
  year: number

  period: string
}

class FinancialSyncSectorFields {
  name: string

  periods: FinancialPeriodFields[]
}

export {
  FinancialFilters,
  FinancialPeriodFields,
  FinancialSyncSecurityFields,
  FinancialSyncSectorFields,
}
