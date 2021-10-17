import { Table, Card, Skeleton } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'

import useFinancialItems from '@components/cards/FinancialStatementCard/hooks/useFinancialItems'
import useFinancialStatementTableColumns from '@components/cards/FinancialStatementCard/hooks/useFinancialStatementTableColumns'
import useFinancialStatementTableItems from '@components/cards/FinancialStatementCard/hooks/useFinancialStatementTableItems'

import { useFinancials } from '@hooks/api/queries/useFinancials'

import { FinancialFreq } from '@lib/financial'
import {
  FinancialStatement,
  financialStatementLabel,
  FinancialItem,
  numberOfItemsForStatement,
} from '@lib/financialItem'

import './FinancialStatementCard.style.less'

interface FinancialStatementProps {
  ticker: string
  statement: FinancialStatement
  financialItems: FinancialItem[]
  loading: boolean
}

const FinancialStatementCard = ({
  ticker,
  financialItems,
  statement,
  loading,
}: FinancialStatementProps) => {
  const maxNumberOfPeriod = 16 // 16 year or quarter
  const paginationLimit =
    numberOfItemsForStatement[statement] * maxNumberOfPeriod
  const { freq: financialFreq } = useParams<{ freq: FinancialFreq }>()

  const { financials, loading: financialsLoading } = useFinancials(
    {
      filters: {
        ticker,
        estimate: false,
        freq: financialFreq,
        statement,
      },
      paginate: {
        offset: 0,
        limit: paginationLimit,
      },
    },
    !ticker
  )

  const formattedFinancials = useFinancialItems(
    financialItems,
    financials,
    statement
  )
  const tableColumns = useFinancialStatementTableColumns(formattedFinancials)
  const tableItems = useFinancialStatementTableItems(formattedFinancials)

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 10 }} active={true} title={false} />
  )

  const FinancialStatementTable = (
    <Table
      size="small"
      sticky
      tableLayout="fixed"
      pagination={false}
      columns={tableColumns}
      dataSource={tableItems}
    />
  )

  return (
    <Card
      className="statement-section"
      style={{ overflowY: 'auto' }}
      title={financialStatementLabel[statement]}
      bordered={false}
    >
      {loading || financialsLoading ? LoadingSkeleton : FinancialStatementTable}
    </Card>
  )
}

export default FinancialStatementCard
