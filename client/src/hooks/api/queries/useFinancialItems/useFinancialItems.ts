import useFinancialItemsQuery from '@hooks/api/queries/useFinancialItems/useFinancialItems.query'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { FinancialItemType, FinancialItem } from '@lib/financialItem'
import { PaginationOptions } from '@lib/paginated'

export type FinancialItemFilters = {
  type: FinancialItemType
}

export type FinancialItemQueryVariables = {
  filters: FinancialItemFilters
  paginate?: PaginationOptions
}

const useFinancialItems = () => {
  const [getFinancialItems, { data, ...rest }] = useLazyPaginatedQuery<
    FinancialItem,
    FinancialItemQueryVariables
  >(useFinancialItemsQuery)

  return { ...rest, getFinancialItems, financialItems: data }
}

export { useFinancialItems }
