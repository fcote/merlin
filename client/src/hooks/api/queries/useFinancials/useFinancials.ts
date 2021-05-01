import useFinancialsQuery from '@hooks/api/queries/useFinancials/useFinancials.query'
import usePaginatedQuery from '@hooks/api/usePaginatedQuery'

import { Financial, FinancialFreq } from '@lib/financial'
import { FinancialItemType, FinancialStatement } from '@lib/financialItem'
import { PaginationOptions } from '@lib/paginated'

export type FinancialFilters = {
  ticker: string
  type?: FinancialItemType
  statement: FinancialStatement
  freq: FinancialFreq
}

export type FinancialQueryVariables = {
  filters: FinancialFilters
  paginate?: PaginationOptions
}

const useFinancials = (
  variables: FinancialQueryVariables,
  skip: boolean = false
) => {
  const { data, ...rest } = usePaginatedQuery<
    Financial,
    FinancialQueryVariables
  >(useFinancialsQuery, { variables, skip })

  return { ...rest, financials: data }
}

export { useFinancials }
