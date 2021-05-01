import { SyncOutlined } from '@ant-design/icons'
import { Card, Table, Tag, Button, Skeleton } from 'antd'
import { ColumnType } from 'antd/lib/table'
import React from 'react'

import { dayjs } from '@helpers/dayjs'

import { useLogs } from '@hooks/api/queries/useLogs'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import StdLog, { getStdLogLevelColor, StdLogLevel } from '@lib/stdLog'

import './Logs.style.less'

const Logs = () => {
  useDocumentTitle('Logs')

  const { data: logs, loading, refetch } = useLogs()

  const columns: ColumnType<any>[] = [
    {
      title: 'Level',
      dataIndex: 'level',
      align: 'left',
      width: 100,
      render: (value: StdLogLevel) => (
        <Tag color={getStdLogLevelColor(value)}>{value}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      align: 'left',
      width: 400,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      align: 'left',
      width: 200,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Data',
      dataIndex: 'data',
      align: 'left',
      render: (_, record: StdLog) => (
        <pre>
          <div style={{ padding: '8px' }}>
            {JSON.stringify(record.data, null, 2)}
          </div>
        </pre>
      ),
    },
  ]

  const LogsTable = (
    <Table
      tableLayout="fixed"
      pagination={false}
      columns={columns}
      dataSource={logs?.map((l) => ({
        ...l,
        key: l.id.toString(),
      }))}
    />
  )

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 20 }} active title={false} />
  )

  return (
    <div className="logs-page">
      <Card
        title="Logs"
        bordered={false}
        extra={
          <Button
            type="text"
            icon={<SyncOutlined />}
            loading={loading}
            onClick={refetch}
          />
        }
      >
        {loading ? LoadingSkeleton : LogsTable}
      </Card>
    </div>
  )
}

export default Logs
