import { useMemo } from 'react'

import { Financial } from '@lib/financial'
import { FinancialItem, FinancialStatement } from '@lib/financialItem'

const useFinancialItems = (
  rawFinancialItems: FinancialItem[],
  rawFinancials: Financial[],
  statement: FinancialStatement
) => {
  return useMemo(() => {
    const items = rawFinancialItems
      ?.filter((fi) => fi.statement === statement)
      ?.map((fi) => ({
        ...fi,
        financials: rawFinancials?.filter((f) => f.financialItemId === fi.id),
      }))
      ?.filter((fi) => fi.financials.length)
    return items ?? []
  }, [rawFinancials, rawFinancialItems, statement])
}

export default useFinancialItems
