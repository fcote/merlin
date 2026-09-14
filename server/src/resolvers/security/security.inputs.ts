import {
  SecurityCompanyOverviewResult,
  SecurityQuoteResult,
} from '@links/types'

class SecurityFields {
  ticker: string

  companyOverview?: SecurityCompanyOverviewResult
  quote?: SecurityQuoteResult
}

class SecurityFilters {
  ticker?: string

  followedSecurityGroupId?: number | string
}

export { SecurityFields, SecurityFilters }
