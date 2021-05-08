import { BarChartOutlined, PlusOutlined } from '@ant-design/icons'
import { Table, Card, Menu, Dropdown, Skeleton, Button } from 'antd'
import { ColumnType } from 'antd/es/table'
import { sortBy } from 'lodash'
import React, { useEffect, useState } from 'react'

import { FollowedSecurityModalItem } from '@components/modals/FollowedSecurityModal/FollowedSecurityModal'
import ConditionalFormatCell from '@components/tables/cells/ConditionalFormatCell/ConditionalFormatCell'

import { computeSkeletonRows } from '@helpers/computeSkeletonRows'

import useWindowSize from '@hooks/useWindowSize'

import FollowedSecurity from '@lib/followedSecurity'
import FollowedSecurityGroup from '@lib/followedSecurityGroup'

import './TrackerCard.style.less'

export interface TrackerItem {
  key: string
  ticker: string
  alias: string
  changePercent: number
  securityId: string
  followedSecurityGroupId: string
  index: number
}

export interface TrackerCardProps {
  tracker: FollowedSecurityGroup
  setCurrentTrackerId: (value: string) => void
  setCurrentTrackerItem: (record: FollowedSecurityModalItem) => void
  setIsTrackerItemModalVisible: (value: boolean) => void
  loading: boolean
}

const TrackerCard: React.FC<TrackerCardProps> = ({
  tracker,
  setCurrentTrackerItem,
  setCurrentTrackerId,
  setIsTrackerItemModalVisible,
  loading,
}) => {
  const windowSize = useWindowSize()

  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([])

  const securityToItem = (fs: FollowedSecurity): TrackerItem => ({
    key: fs.id,
    ticker: fs.security.ticker,
    alias: fs.alias,
    changePercent: fs.security.dayChangePercent,
    index: fs.index,
    securityId: fs.security.id,
    followedSecurityGroupId: tracker.id,
  })

  const onTrackerItemClick = (record: TrackerItem) => () => {
    setCurrentTrackerId(tracker.id)
    setCurrentTrackerItem({
      ticker: record.ticker,
      securityId: record.securityId,
      alias: record.alias,
      index: record.index,
    })
    setIsTrackerItemModalVisible(true)
  }

  const handleAddTrackerItem = (sg: FollowedSecurityGroup) => {
    setCurrentTrackerId(sg.id)
    setIsTrackerItemModalVisible(true)
  }

  const contextMenu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<PlusOutlined />}
        onClick={() => {
          setCurrentTrackerItem(null)
          handleAddTrackerItem(tracker)
        }}
      >
        New item
      </Menu.Item>
    </Menu>
  )

  const tableColumns: ColumnType<any>[] = [
    { dataIndex: 'alias', align: 'left' },
    {
      dataIndex: 'changePercent',
      align: 'right',
      width: 70,
      render: (_, record: TrackerItem) =>
        ConditionalFormatCell('changePercent', record, 'percentage'),
    },
    {
      dataIndex: 'link',
      align: 'right',
      width: 40,
      render: (_, record: TrackerItem) => (
        <Button
          type="link"
          onClick={(event) => event.stopPropagation()}
          href={`/security/${record.ticker}/chart`}
          icon={<BarChartOutlined />}
        />
      ),
    },
  ]

  useEffect(() => {
    if (!tracker.followedSecurities?.nodes) return

    setTrackerItems(
      sortBy(
        tracker.followedSecurities.nodes.map(securityToItem),
        (s) => s.index
      )
    )
  }, [tracker])

  const LoadingSkeleton = (
    <Skeleton
      paragraph={{
        rows: computeSkeletonRows(windowSize.height, 200),
      }}
      title={false}
      active
    />
  )

  const CardTitleLoadingSkeleton = (
    <Skeleton paragraph={{ rows: 1 }} title={false} active />
  )

  const CardContent = () => {
    if (loading) return LoadingSkeleton

    return (
      <Table
        className="clickable-row"
        size="small"
        tableLayout="fixed"
        showHeader={false}
        pagination={false}
        columns={tableColumns}
        dataSource={trackerItems}
        onRow={(record: TrackerItem) => ({
          onClick: onTrackerItemClick(record),
        })}
      />
    )
  }

  return (
    <Dropdown overlay={contextMenu} trigger={['contextMenu']}>
      <Card
        className="tracker-card"
        key={tracker.id}
        title={loading ? CardTitleLoadingSkeleton : tracker.name}
        bordered={false}
      >
        {CardContent()}
      </Card>
    </Dropdown>
  )
}

export default TrackerCard
