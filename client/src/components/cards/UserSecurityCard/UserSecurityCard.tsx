import { Table, Card, Skeleton } from 'antd'
import { ColumnType } from 'antd/lib/table'
import React from 'react'

import ConditionalFormatCell from '@components/tables/cells/ConditionalFormatCell/ConditionalFormatCell'

import './UserSecurityCard.style.less'

export interface UserAccountSecurityItem {
  key: string
  name: string
  profit: string
  volume: string
  openPrice: string
  children?: UserAccountSecurityItem[]
}

export interface UserSecurityCardProps {
  title: string
  items: UserAccountSecurityItem[]
  loading: boolean
  columns?: ColumnType<any>[]
  extra?: React.ReactNode
  emptyText?: string
}

const defaultColumns: ColumnType<any>[] = [
  { title: 'Ticker', dataIndex: 'name', align: 'left' },
  { title: 'Volume', dataIndex: 'volume', align: 'right' },
  { title: 'Open price', dataIndex: 'openPrice', align: 'right' },
]

const UserSecurityCard: React.FC<UserSecurityCardProps> = ({
  title,
  items,
  loading,
  columns,
  extra,
  emptyText,
}) => {
  if (!columns) {
    columns = defaultColumns
  }

  const SecurityTable = () => (
    <Table
      size="small"
      pagination={false}
      columns={columns}
      dataSource={items}
      locale={{ emptyText }}
    />
  )

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 5 }} title={false} active />
  )

  return (
    <Card
      className="user-security-card"
      bordered={false}
      title={title}
      extra={extra}
    >
      {loading ? LoadingSkeleton : SecurityTable()}
    </Card>
  )
}

export default UserSecurityCard
