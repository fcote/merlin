import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { PageHeader, Card, Badge, Button, Space } from 'antd'
import { HeaderRender } from 'antd/es/calendar/generateCalendar'
import { sortBy } from 'lodash'
import React from 'react'

import Calendar from '@components/Calendar'
import { Scrollbar } from '@components/Scrollbar'

import { dayjs } from '@helpers/dayjs'

import { useSelfEarnings } from '@hooks/api/queries/useSelfEarnings'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import { EarningTime, Earning } from '@lib/earning'

const EarningsCalendar = () => {
  useDocumentTitle('Earnings')

  const { data: rawEarnings } = useSelfEarnings(dayjs().format('YYYY-MM-DD'))

  const followedInPriority = {
    account: 1,
    watchlist: 0,
  }
  const earningTimePriority = {
    [EarningTime.beforeMarketOpen]: 1,
    [EarningTime.afterMarketClose]: 0,
  }

  const sortEarnings = (earnings: Earning[]) => {
    return sortBy(
      earnings,
      (e) =>
        followedInPriority[e.security.followedIn] * 10 +
        earningTimePriority[e.time]
    ).reverse()
  }

  const header: HeaderRender<dayjs.Dayjs> = ({ value, onChange }) => {
    const switchMonth = (nMonths: number) => {
      onChange(value.clone().month(value.month() + nMonths))
    }

    return (
      <div className="earnings-calendar-header">
        <PageHeader
          title={value.format('MMMM YYYY')}
          extra={
            <Space align="end">
              <Button icon={<LeftOutlined />} onClick={() => switchMonth(-1)} />
              <Button icon={<RightOutlined />} onClick={() => switchMonth(1)} />
            </Space>
          }
        />
        <br />
      </div>
    )
  }

  const cell = (value: dayjs.Dayjs): React.ReactNode => {
    const date = value.format('YYYY-MM-DD')
    const cellEarnings = sortEarnings(
      rawEarnings?.filter((e) => dayjs(e.date).format('YYYY-MM-DD') === date)
    )

    return (
      <div className="earnings-cell" style={{ height: '100%' }}>
        <Scrollbar>
          {cellEarnings.map((earning) => (
            <div key={earning.id}>
              <Badge
                status={
                  earning.security.followedIn === 'account'
                    ? 'warning'
                    : 'default'
                }
              />
              {earning.security.ticker} ({earning.time})
            </div>
          ))}
        </Scrollbar>
      </div>
    )
  }

  return (
    <div className="earnings-calendar">
      <PageHeader title="Earnings calendar" />
      <br />
      <Card bordered={false}>
        <Calendar
          headerRender={header}
          dateCellRender={cell}
          mode="month"
          fullscreen={true}
        />
      </Card>
    </div>
  )
}

export default EarningsCalendar
