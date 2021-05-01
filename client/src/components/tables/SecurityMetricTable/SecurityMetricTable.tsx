import { Table, Skeleton, Card } from 'antd'
import { ColumnType } from 'antd/es/table'
import { keyBy } from 'lodash'
import React, { useMemo, useEffect } from 'react'

import {
  FinancialRatioCell,
  FinancialRatioCellProps,
} from '@components/tables/cells/FinancialStatementCell/FinancialStatementCell'

import { formatBigValue } from '@helpers/formatBigValue'

import { useFinancialsTTM } from '@hooks/api/queries/useFinancialsTTM'

import { FinancialUnitType, FinancialUnit } from '@lib/financialItem'
import { Security } from '@lib/security'

import './SecurityMetricTable.style.less'

export type SecurityMetricTableProps = {
  security: Security
  securityLoading: boolean
}

const SecurityMetricTable: React.FC<SecurityMetricTableProps> = ({
  security,
  securityLoading,
}) => {
  const {
    getFinancialsTTM: getTTMRatios,
    financials: ttmRatios,
    loading,
  } = useFinancialsTTM()

  const renderRatio = (ratioItem: FinancialRatioCellProps) => {
    if (!ratioItem) return null
    return (
      <FinancialRatioCell
        value={ratioItem.value}
        performance={ratioItem.performance}
      />
    )
  }

  const renderColumnTitle = (title: string) => {
    return title
  }

  const columns: ColumnType<any>[] = [
    { title: renderColumnTitle('Price'), dataIndex: 'price' },
    {
      title: renderColumnTitle('MC'),
      dataIndex: 'marketCapitalization',
    },
    { title: renderColumnTitle('Shares'), dataIndex: 'sharesOutstanding' },
    { title: renderColumnTitle('52W L'), dataIndex: 'low52w' },
    { title: renderColumnTitle('52W H'), dataIndex: 'high52w' },
    {
      title: renderColumnTitle('GM'),
      dataIndex: 'grossMargin',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('OM'),
      dataIndex: 'operatingMargin',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('NM'),
      dataIndex: 'netMargin',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('P/B'),
      dataIndex: 'priceToBookValue',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('P/S'),
      dataIndex: 'priceToSales',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('P/E'),
      dataIndex: 'priceToEarnings',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('P/FCF'),
      dataIndex: 'priceToFreeCashFlow',
      render: renderRatio,
    },
    {
      title: renderColumnTitle('P/OCF'),
      dataIndex: 'priceToOperatingCashFlow',
      render: renderRatio,
    },
    { title: renderColumnTitle('ROE'), dataIndex: 'roe', render: renderRatio },
    { title: renderColumnTitle('ROA'), dataIndex: 'roa', render: renderRatio },
    {
      title: renderColumnTitle('D/E'),
      dataIndex: 'debtToEquity',
      render: renderRatio,
    },
  ]

  useEffect(() => {
    if (!security) return

    void getTTMRatios({
      variables: {
        ticker: security.ticker,
      },
    })
  }, [security])

  const items = useMemo(() => {
    if (!ttmRatios.length) return

    const ratios = keyBy(ttmRatios, (r) => r.financialItem.slug)

    const getRatio = (key: string): FinancialRatioCellProps => ({
      value: ratios[key].value?.toFixed(2),
      performance: ratios[key].performance,
    })

    return [
      {
        key: security.id,
        price: security.currentPrice,
        marketCapitalization: formatBigValue(
          security.marketCapitalization,
          FinancialUnitType.currency,
          FinancialUnit.millions
        ),
        sharesOutstanding: formatBigValue(
          security.sharesOutstanding,
          FinancialUnitType.amount,
          FinancialUnit.millions
        ),
        high52w: security.high52Week,
        low52w: security.low52Week,
        grossMargin: getRatio('grossProfitMargin'),
        operatingMargin: getRatio('operatingProfitMargin'),
        netMargin: getRatio('netProfitMargin'),
        priceToBookValue: getRatio('priceToBookValue'),
        priceToSales: getRatio('priceToSales'),
        priceToEarnings: getRatio('priceToEarnings'),
        priceToFreeCashFlow: getRatio('priceToFreeCashFlow'),
        priceToOperatingCashFlow: getRatio('priceToCashFlow'),
        roe: getRatio('returnOnEquity'),
        roa: getRatio('returnOnAssets'),
        debtToEquity: getRatio('debtToEquity'),
      },
    ]
  }, [ttmRatios])

  const SecurityMetricsTable = (
    <Table
      className="security-metrics-table"
      size="small"
      tableLayout="fixed"
      pagination={false}
      bordered={false}
      columns={columns}
      dataSource={items}
    />
  )

  const LoadingSkeleton = (
    <Skeleton
      paragraph={{
        rows: 2,
        width: '100%',
      }}
      title={false}
      active
    />
  )

  return (
    <Card bordered={false} className="security-metrics-card">
      {loading || securityLoading ? LoadingSkeleton : SecurityMetricsTable}
    </Card>
  )
}

export default SecurityMetricTable
