import { Card, Table, Tag, Skeleton, PageHeader, Row, Col } from 'antd'
import { ColumnType } from 'antd/es/table'
import { uniq } from 'lodash'
import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

import ConditionalFormatCell from '@components/tables/cells/ConditionalFormatCell/ConditionalFormatCell'

import { computeSkeletonRows } from '@helpers/computeSkeletonRows'
import { standardCardOffset } from '@helpers/sizes/standardCardOffset'

import { useForex } from '@hooks/api/queries/useForex'
import { useSelfProfile } from '@hooks/api/queries/useSelfProfile'
import {
  useSelfUserAccountSecurities,
  subscribeToMoreUserAccountSecurityPrices,
} from '@hooks/api/queries/useSelfUserAccountSecurities/useSelfUserAccountSecurities'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import useWindowSize from '@hooks/useWindowSize'

import { FinancialItemType } from '@lib/financialItem'

import {
  usePortfolioItems,
  PortfolioItem,
} from '@pages/Portfolio/hooks/usePortfolioItems'

import './Portfolio.style.less'
import PortfolioStats from './PortfolioStats'

const columns: ColumnType<any>[] = [
  {
    title: 'Ticker',
    dataIndex: 'name',
    align: 'left',
    render: (_, record: PortfolioItem) => (
      <Tag>
        <Link to={`/security/${record.name}/${FinancialItemType.statement}/Y`}>
          {record.name}
        </Link>
      </Tag>
    ),
  },
  {
    title: 'Size',
    dataIndex: 'size',
    align: 'left',
    render: (value) => `${value.toFixed(2)} %`,
  },
  {
    title: 'Market cap.',
    dataIndex: 'marketCapitalization',
    align: 'left',
  },
  { title: 'Price', dataIndex: 'price', align: 'left' },
  {
    title: '% Change (Day)',
    dataIndex: 'dayChangePercent',
    align: 'left',
    render: (_, record) =>
      ConditionalFormatCell('dayChangePercent', record, 'percentage'),
  },
  { title: '52 Week High', dataIndex: 'high52Week', align: 'left' },
  { title: '52 Week Low', dataIndex: 'low52Week', align: 'left' },
  { title: 'Volume', dataIndex: 'volume', align: 'left' },
  {
    title: 'Open price',
    dataIndex: 'avgOpenPrice',
    align: 'left',
    render: (value) => value.toFixed(2),
  },
  {
    title: 'P/L',
    dataIndex: 'profit',
    align: 'left',
    render: (_, record) => ConditionalFormatCell('profit', record),
  },
]

const Portfolio = () => {
  useDocumentTitle('Portfolio')

  const [subscribed, setSubscribed] = useState<boolean>(false)

  const windowSize = useWindowSize()
  const {
    data: userSecurities,
    loading,
    subscribeToMore,
  } = useSelfUserAccountSecurities()
  const { data: userProfile, loading: userProfileLoading } = useSelfProfile()
  const { forex, getForex, loading: forexLoading } = useForex()

  const portfolioItems = usePortfolioItems(
    userSecurities,
    userProfile?.currency,
    forex
  )

  useMemo(() => {
    if (!userSecurities?.length || !userProfile) return

    const foreignCurrencies = uniq(
      userSecurities
        .filter((us) => us.currency !== userProfile.currency)
        .map((us) => us.currency)
    )
    const currencyPairs = foreignCurrencies.map((currency) => ({
      fromCurrency: currency,
      toCurrency: userProfile.currency,
    }))

    void getForex({
      variables: {
        filters: {
          currencyPairs,
        },
      },
    })
  }, [userSecurities, userProfile])

  useEffect(() => {
    if (!subscribeToMore || subscribed || !userSecurities?.length) return

    const tickers = userSecurities.map((s) => s.security.ticker)
    subscribeToMore(subscribeToMoreUserAccountSecurityPrices(tickers))
    setSubscribed(true)
  }, [userSecurities])

  const PortfolioTable = (
    <Table pagination={false} columns={columns} dataSource={portfolioItems} />
  )

  const LoadingSkeleton = (
    <Skeleton
      paragraph={{
        rows: computeSkeletonRows(windowSize.height, standardCardOffset),
      }}
      title={false}
      active
    />
  )

  return (
    <div className="portfolio">
      <PageHeader title="Portfolio" style={{ marginBottom: 16 }} />
      <Row gutter={16}>
        <Col span={19}>
          <Card bordered={false}>
            {loading ? LoadingSkeleton : PortfolioTable}
          </Card>
        </Col>
        <Col span={5}>
          <PortfolioStats
            portfolioItems={portfolioItems}
            userCurrency={userProfile?.currency}
            forex={forex}
            loading={loading || forexLoading || userProfileLoading}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Portfolio
