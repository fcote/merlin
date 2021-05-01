import { PlusOutlined } from '@ant-design/icons'
import { Table, Button, Divider } from 'antd'
import { ColumnType } from 'antd/es/table'
import React, { useState, useEffect } from 'react'

import EditableCell, {
  EditableCellProps,
} from '@components/tables/EditableTable/EditableCell'
import EditableRow from '@components/tables/EditableTable/EditableRow'

import './EditableTable.style.less'

export type EditableTableProps<T = any> = {
  columns: EditableColumn[]
  items: T[]
  defaultItem?: () => T
  handleSave: (item: T) => void
  showHeaders?: boolean
  showDivider?: boolean
  className?: string
  emptyText?: React.ReactNode
}

export type EditableRecord = {
  editable: { [attr: string]: boolean }
  editing: boolean
}

export type EditableColumn = ColumnType<any> & {
  title: string
  dataIndex: string
  editable: boolean
  required: boolean
  onCell?: (record: EditableRecord, index?: number) => EditableCellProps
}

const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  items,
  defaultItem,
  handleSave,
  className,
  showHeaders,
  showDivider,
  emptyText,
}) => {
  const [dataSource, setDataSource] = useState(items)
  const [editableColumns, setEditableColumns] = useState<EditableColumn[]>(null)

  const handleAdd = () => {
    const newData = defaultItem()
    setDataSource([...dataSource, newData])
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }

  useEffect(() => {
    setDataSource([...items])
  }, [items])

  useEffect(() => {
    const handleCellClick = (col: EditableColumn) => (
      record: EditableRecord
    ): EditableCellProps => ({
      record,
      title: col.title,
      editable: record.editable[col.dataIndex],
      required: col.required,
      dataIndex: col.dataIndex,
      handleSave: handleSave,
    })

    const formattedColumns: EditableColumn[] = columns.map((col) => {
      if (!col.editable) {
        return col
      }
      return {
        ...col,
        onCell: handleCellClick(col),
      }
    })
    setEditableColumns(formattedColumns)
  }, [columns, handleSave])

  return (
    <div className="editable-table">
      <Table
        size="small"
        tableLayout="fixed"
        pagination={false}
        showHeader={!!showHeaders}
        components={components}
        rowClassName={() => 'editable-row'}
        dataSource={dataSource}
        columns={editableColumns}
        locale={{ emptyText }}
        className={className}
      />
      {showDivider && <Divider style={{ margin: '0 0 12px 0' }} />}
      {defaultItem && (
        <Button
          onClick={handleAdd}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
        />
      )}
    </div>
  )
}

export default EditableTable
