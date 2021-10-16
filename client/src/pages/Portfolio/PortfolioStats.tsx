import { Card, Statistic, Table } from 'antd'
import React from 'react'

import { Forex } from '@lib/forex'

import {
  usePortfolioChanges,
  PortfolioChange,
} from '@pages/Portfolio/hooks/usePortfolioChanges'
import { PortfolioItem } from '@pages/Portfolio/hooks/usePortfolioItems'
import { usePortfolioSectorWeights } from '@pages/Portfolio/hooks/usePortfolioSectorWeights'

interface PortfolioStatsProps {
  portfolioItems: PortfolioItem[]
  forex: Forex[]
  userCurrency: string
  loading: boolean
}

const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  portfolioItems,
  userCurrency,
  forex,
  loading,
}) => {
  const { portfolioDayChange, portfolioWeekChange, portfolioAllTimeChange } =
    usePortfolioChanges(portfolioItems, userCurrency, forex)
  const portfolioSectorWeights = usePortfolioSectorWeights(portfolioItems)

  const PortfolioStatistic = (title: string, change: PortfolioChange) => {
    const changeValue = change?.value ? ` (${change?.value.toFixed(2)})` : ''
    return (
      <Statistic
        title={title}
        value={change?.percent}
        precision={2}
        groupSeparator=""
        loading={loading}
        valueStyle={{
          color: change?.value > 0 ? '#a9d134' : '#a61d24',
        }}
        suffix={`%${changeValue}`}
      />
    )
  }

  const PortfolioSectorWeights = (
    <Table
      size="small"
      columns={[
        { title: '', dataIndex: 'sector' },
        {
          title: '',
          dataIndex: 'weight',
          render: (value) => `${value.toFixed(2)} %`,
        },
      ]}
      dataSource={portfolioSectorWeights}
      showHeader={false}
      pagination={false}
    />
  )

  return (
    <div className="portfolio-stats">
      <Card
        key="pl-all-time"
        style={{ padding: 18, marginBottom: 16 }}
        bordered={false}
      >
        {PortfolioStatistic('P/L', portfolioAllTimeChange)}
      </Card>
      <Card
        key="pl-week"
        style={{ padding: 18, marginBottom: 16 }}
        bordered={false}
      >
        {PortfolioStatistic('P/L - Week', portfolioWeekChange)}
      </Card>
      <Card
        key="pl-day"
        style={{ padding: 18, marginBottom: 16 }}
        bordered={false}
      >
        {PortfolioStatistic('P/L - Day', portfolioDayChange)}
      </Card>
      <Card key="sector-weights" bordered={false}>
        {PortfolioSectorWeights}
      </Card>
    </div>
  )
}

export default PortfolioStats
