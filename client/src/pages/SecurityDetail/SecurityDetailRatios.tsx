import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import FinancialStatementCard from '@components/cards/FinancialStatementCard/FinancialStatementCard'

import { useFinancialItems } from '@hooks/api/queries/useFinancialItems'

import { FinancialFreq } from '@lib/financial'
import { FinancialItemType, FinancialRatioStatement } from '@lib/financialItem'
import { Security } from '@lib/security'

export interface SecurityDetailRatiosProps {
  security: Security
}

const SecurityDetailRatios: React.FC<SecurityDetailRatiosProps> = ({
  security,
}) => {
  const { freq: financialFreq } = useParams<{ freq: FinancialFreq }>()
  const {
    getFinancialItems,
    financialItems,
    loading: financialItemsLoading,
  } = useFinancialItems()

  useMemo(() => {
    if (!security) return

    void getFinancialItems({
      variables: {
        filters: {
          type: FinancialItemType.ratio,
        },
      },
    })
  }, [security, financialFreq])

  return (
    <div className="financial-section">
      <FinancialStatementCard
        statement={FinancialRatioStatement.valuationRatios}
        ticker={security?.ticker}
        financialItems={financialItems}
        estimate={false}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialRatioStatement.cashFlowRatios}
        ticker={security?.ticker}
        financialItems={financialItems}
        estimate={false}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialRatioStatement.profitabilityRatios}
        ticker={security?.ticker}
        financialItems={financialItems}
        estimate={false}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialRatioStatement.debtRatios}
        ticker={security?.ticker}
        financialItems={financialItems}
        estimate={false}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialRatioStatement.liquidityRatios}
        ticker={security?.ticker}
        financialItems={financialItems}
        estimate={false}
        loading={financialItemsLoading || !security}
      />
    </div>
  )
}

export default SecurityDetailRatios
