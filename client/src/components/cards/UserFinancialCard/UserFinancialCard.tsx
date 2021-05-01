import { Table, Card, Skeleton } from 'antd'
import { ColumnType } from 'antd/lib/table'
import React from 'react'

import EditableTable, {
  EditableTableProps,
  EditableColumn,
} from '@components/tables/EditableTable/EditableTable'

import './UserFinancialCard.style.less'

export type UserFinancialItem<T = any> = {
  key: string
  label: string
  value: string
  instance?: T
  editing?: boolean
  editable?: { [key: string]: boolean }
  [key: string]: any
}

export type UserFinancialCardEditableTableProps = Omit<
  EditableTableProps,
  'items' | 'columns'
>

export type UserFinancialCardProps = {
  title: string
  items: UserFinancialItem[]
  extra?: any
  columns?: ColumnType<any>[] | EditableColumn[]
  onRowClick?: (r: any) => () => void
  emptyText?: React.ReactNode
  loading: boolean
  editable?: UserFinancialCardEditableTableProps
}

const defaultColumns: ColumnType<any>[] = [
  { dataIndex: 'label', align: 'left' },
  { dataIndex: 'value', align: 'right' },
]

const UserFinancialCard: React.FC<UserFinancialCardProps> = ({
  title,
  items,
  extra,
  columns,
  onRowClick,
  emptyText,
  loading,
  editable,
}) => {
  if (!columns) {
    columns = !editable
      ? defaultColumns
      : defaultColumns.map((c) => ({ ...c, editable: true, required: false }))
  }

  const FinancialTable = () => (
    <Table
      size="small"
      locale={{ emptyText }}
      className={onRowClick ? 'clickable-row' : ''}
      showHeader={false}
      pagination={false}
      columns={columns}
      dataSource={items}
      onRow={(r) => ({
        onClick: onRowClick && onRowClick(r),
      })}
    />
  )

  const FinancialEditableTable = () => (
    <EditableTable
      showDivider={editable.showDivider}
      columns={columns as EditableColumn[]}
      items={items}
      defaultItem={editable.defaultItem}
      handleSave={editable.handleSave}
      emptyText={emptyText}
    />
  )

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 5 }} title={false} active />
  )

  return (
    <Card
      className="user-financial-card"
      extra={extra}
      bordered={false}
      title={title}
    >
      {loading
        ? LoadingSkeleton
        : editable
        ? FinancialEditableTable()
        : FinancialTable()}
    </Card>
  )
}

export default UserFinancialCard
