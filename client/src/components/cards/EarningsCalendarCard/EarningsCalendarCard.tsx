import { ProfileOutlined } from '@ant-design/icons'
import { Card, Table, Skeleton, Button } from 'antd'
import { ColumnType } from 'antd/es/table'
import React, { useMemo, useState } from 'react'

import EarningCallTranscriptModal from '@components/modals/EarningCallTranscriptModal/EarningCallTranscriptModal'
import ConditionalFormatCell from '@components/tables/cells/ConditionalFormatCell/ConditionalFormatCell'

import { dayjs } from '@helpers/dayjs'
import { formatBigValue } from '@helpers/formatBigValue'

import { Earning, EarningTimeLabel } from '@lib/earning'
import { FinancialUnitType, FinancialUnit } from '@lib/financialItem'

import './EarningsCalendarCard.style.less'

export type EarningsCalendarCardProps = {
  earnings: Earning[]
  loading: boolean
}

const EarningsCalendarCard: React.FC<EarningsCalendarCardProps> = ({
  earnings,
  loading,
}) => {
  const [
    isEarningCallTranscriptModalVisible,
    setIsEarningCallTranscriptModalVisible,
  ] = useState<boolean>(false)
  const [currentEarningInstance, setCurrentEarningInstance] = useState<Earning>(
    null
  )
  const defaultColumns: ColumnType<any>[] = [
    { title: 'Date', dataIndex: 'date' },
  ]

  const showEarningCallTranscript = (record: Earning) => {
    setCurrentEarningInstance(record)
    setIsEarningCallTranscriptModalVisible(true)
  }

  const { items, columns } = useMemo(() => {
    const hasKey = (earningItems: Earning[], key: keyof Earning) => {
      return earningItems.some((i) => i[key])
    }

    const earningItems = earnings.map((ed) => ({
      ...ed,
      key: ed.id,
      date: dayjs(ed.date).format('DD/MM/YYYY'),
      fiscalPeriod: `${ed.fiscalYear} (Q${ed.fiscalQuarter})`,
      time: ed.time ? EarningTimeLabel[ed.time] : null,
      epsSurprisePercent: ed.epsSurprisePercent,
      revenueSurprisePercent: ed.revenueSurprisePercent,
      revenueEstimate: formatBigValue(
        ed?.revenueEstimate,
        FinancialUnitType.currency,
        FinancialUnit.millions
      ),
      revenue: formatBigValue(
        ed?.revenue,
        FinancialUnitType.currency,
        FinancialUnit.millions
      ),
    }))

    let earningColumns = [...defaultColumns]

    if (hasKey(earnings, 'fiscalYear') && hasKey(earnings, 'fiscalQuarter')) {
      earningColumns.push({ title: 'Fiscal period', dataIndex: 'fiscalPeriod' })
    }
    if (hasKey(earnings, 'time')) {
      earningColumns.push({ title: 'Time', dataIndex: 'time' })
    }
    if (hasKey(earnings, 'epsEstimate')) {
      earningColumns.push({ title: 'EPS estimate', dataIndex: 'epsEstimate' })
    }
    if (hasKey(earnings, 'eps')) {
      earningColumns.push({ title: 'EPS', dataIndex: 'eps' })
    }
    if (hasKey(earnings, 'epsSurprisePercent')) {
      earningColumns.push({
        title: 'EPS surprise',
        dataIndex: 'epsSurprisePercent',
        render: (_, record) =>
          ConditionalFormatCell('epsSurprisePercent', record, 'percentage'),
      })
    }
    if (hasKey(earnings, 'revenueEstimate')) {
      earningColumns.push({
        title: 'Revenue estimate',
        dataIndex: 'revenueEstimate',
      })
    }
    if (hasKey(earnings, 'revenue')) {
      earningColumns.push({ title: 'Revenue', dataIndex: 'revenue' })
    }
    if (hasKey(earnings, 'revenueSurprisePercent')) {
      earningColumns.push({
        title: 'Revenue surprise',
        dataIndex: 'revenueSurprisePercent',
        render: (_, record) =>
          ConditionalFormatCell('revenueSurprisePercent', record, 'percentage'),
      })
    }
    if (hasKey(earnings, 'fiscalYear') && hasKey(earnings, 'fiscalQuarter')) {
      const CallTranscriptButton = (record: Earning) => {
        if (!record.eps && !record.revenue) return null
        return (
          <Button
            key="remove-followed-security-button"
            onClick={() => showEarningCallTranscript(record)}
            type="text"
            icon={<ProfileOutlined />}
          />
        )
      }

      earningColumns.push({
        title: 'Call transcript',
        dataIndex: '',
        align: 'center',
        render: (_, record: Earning) => CallTranscriptButton(record),
      })
    }

    return { items: earningItems, columns: earningColumns }
  }, [earnings])

  const EarningsCalendarTable = () => (
    <Table
      size="small"
      pagination={false}
      columns={columns}
      dataSource={items}
    />
  )

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 5 }} title={false} active />
  )

  return (
    <Card
      className="security-earnings-calendar-card"
      title="Earnings"
      bordered={false}
    >
      <EarningCallTranscriptModal
        earning={currentEarningInstance}
        isVisible={isEarningCallTranscriptModalVisible}
        setIsVisible={setIsEarningCallTranscriptModalVisible}
      />
      <div className="security-earnings-calendar-content">
        {loading ? LoadingSkeleton : EarningsCalendarTable()}
      </div>
    </Card>
  )
}

export default EarningsCalendarCard
