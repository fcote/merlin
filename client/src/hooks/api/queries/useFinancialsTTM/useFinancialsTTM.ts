import useFinancialsTTMQuery from '@hooks/api/queries/useFinancialsTTM/useFinancialsTTM.query'
import useLazyPaginatedQuery from '@hooks/api/useLazyPaginatedQuery'

import { Financial } from '@lib/financial'

export type FinancialTTMQueryVariables = {
  ticker: string
}

const useFinancialsTTM = () => {
  const [getFinancialsTTM, { data, ...rest }] = useLazyPaginatedQuery<
    Financial,
    FinancialTTMQueryVariables
  >(useFinancialsTTMQuery)

  return { ...rest, getFinancialsTTM, financials: data }
}

export { useFinancialsTTM }
