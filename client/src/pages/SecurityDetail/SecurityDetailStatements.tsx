import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import FinancialStatementCard from '@components/cards/FinancialStatementCard/FinancialStatementCard'

import { useFinancialItems } from '@hooks/api/queries/useFinancialItems'

import { FinancialFreq } from '@lib/financial'
import { FinancialBaseStatement, FinancialItemType } from '@lib/financialItem'
import { Security } from '@lib/security'

export interface SecurityDetailStatementsProps {
  security: Security
}

const SecurityDetailStatements: React.FC<SecurityDetailStatementsProps> = ({
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
          type: FinancialItemType.statement,
        },
      },
    })
  }, [security, financialFreq])

  return (
    <div className="financial-section">
      <FinancialStatementCard
        statement={FinancialBaseStatement.incomeStatement}
        ticker={security?.ticker}
        financialItems={financialItems}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialBaseStatement.balanceSheet}
        ticker={security?.ticker}
        financialItems={financialItems}
        loading={financialItemsLoading || !security}
      />
      <FinancialStatementCard
        statement={FinancialBaseStatement.cashFlowStatement}
        ticker={security?.ticker}
        financialItems={financialItems}
        loading={financialItemsLoading || !security}
      />
    </div>
  )
}

export default SecurityDetailStatements
