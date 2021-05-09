import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Card,
  Table,
  Skeleton,
  PageHeader,
  Row,
  Col,
  Button,
  Space,
} from 'antd'
import { ColumnType } from 'antd/es/table'
import { uniq } from 'lodash'
import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

import UserAccountSecurityModal from '@components/modals/UserAccountSecurityModal/UserAccountSecurityModal'
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

const Portfolio = () => {
  useDocumentTitle('Portfolio')

  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [isFormModalVisible, setIsFormModalVisible] = useState<boolean>(false)
  const [selectedTicker, setSelectedTicker] = useState<string>()

  const windowSize = useWindowSize()
  const {
    data: userSecurities,
    loading,
    subscribeToMore,
    refetch: refetchUserSecurities,
  } = useSelfUserAccountSecurities()
  const { data: userProfile, loading: userProfileLoading } = useSelfProfile()
  const { forex, getForex, loading: forexLoading } = useForex()

  const portfolioItems = usePortfolioItems(
    userSecurities,
    userProfile?.currency,
    forex
  )

  const showFormModal = (record?: PortfolioItem) => {
    setSelectedTicker(record?.security?.ticker)
    setIsFormModalVisible(true)
  }

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

  const columns: ColumnType<any>[] = [
    {
      title: 'Ticker',
      dataIndex: 'name',
      align: 'left',
      render: (_, record: PortfolioItem) => (
        <Link
          to={`/security/${record.name}/${FinancialItemType.statement}/Y`}
          className="ant-btn ant-btn-sm"
        >
          {record.name}
        </Link>
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
      title: '%C',
      dataIndex: 'dayChangePercent',
      align: 'left',
      render: (_, record) =>
        ConditionalFormatCell('dayChangePercent', record, 'percentage'),
    },
    { title: '52W H', dataIndex: 'high52Week', align: 'left' },
    { title: '52W L', dataIndex: 'low52Week', align: 'left' },
    { title: 'Volume', dataIndex: 'volume', align: 'left' },
    {
      title: 'Open',
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
    {
      title: '',
      dataIndex: 'operation',
      align: 'right',
      render: (_, record) => (
        <Button onClick={() => showFormModal(record)} icon={<EditOutlined />} />
      ),
    },
  ]

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

  const PortfolioTitle = (
    <Space align="center">
      <div>Portfolio</div>
      <Button
        key="add-button"
        onClick={() => showFormModal()}
        icon={<PlusOutlined />}
      />
    </Space>
  )

  return (
    <div className="portfolio">
      <UserAccountSecurityModal
        ticker={selectedTicker}
        onTickerChange={setSelectedTicker}
        isVisible={isFormModalVisible}
        setIsVisible={setIsFormModalVisible}
        userCurrency={userProfile?.currency}
        triggerRefresh={refetchUserSecurities}
      />
      <PageHeader title={PortfolioTitle} style={{ marginBottom: 16 }} />
      <Row gutter={16}>
        <Col flex="1 1 900px">
          <Card bordered={false}>
            {loading ? LoadingSkeleton : PortfolioTable}
          </Card>
        </Col>
        <Col flex="0 1 300px">
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
