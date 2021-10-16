import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { Card, Space, Skeleton, Input, Button } from 'antd'
import React, { useState } from 'react'

import useWatchlistTableColumns from '@components/cards/WatchlistCard/hooks/useWatchlistTableColumns'
import useWatchlistTableItems from '@components/cards/WatchlistCard/hooks/useWatchlistTableItems'
import EditableTable from '@components/tables/EditableTable/EditableTable'

import { computeSkeletonRows } from '@helpers/computeSkeletonRows'
import { standardCardOffset } from '@helpers/sizes/standardCardOffset'

import useWindowSize from '@hooks/useWindowSize'

import FollowedSecurityGroup from '@lib/followedSecurityGroup'

interface SecurityTableProps {
  watchlist: FollowedSecurityGroup
  triggerRefresh: () => void
  loading: boolean
}

const WatchlistCard = ({
  watchlist,
  triggerRefresh,
  loading,
}: SecurityTableProps) => {
  const [searchText, setSearchText] = useState<string>('')

  const windowSize = useWindowSize()

  const { watchlistItems, handleAdd, handleSave, handleRemove } =
    useWatchlistTableItems(watchlist, searchText, triggerRefresh)
  const columns = useWatchlistTableColumns(watchlistItems, handleRemove)

  const WatchlistTable = () => (
    <EditableTable
      className="watchlist-table"
      showHeaders={true}
      columns={columns}
      items={watchlistItems}
      handleSave={handleSave}
    />
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

  const HeaderTitle = (
    <Space align="center">
      <div>{watchlist.name}</div>
      <Button
        key="add-button"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        style={{ display: 'block' }}
      />
    </Space>
  )

  const HeaderLoadingSkeleton = (
    <Skeleton paragraph={{ rows: 1 }} title={false} active />
  )

  const FilterInput = (
    <Input
      size="large"
      placeholder="Filter tickers"
      prefix={<SearchOutlined />}
      onChange={(event) => setSearchText(event.target.value)}
      style={{
        width: 200,
        borderRadius: 8,
      }}
    />
  )

  return (
    <Card
      title={loading ? HeaderLoadingSkeleton : HeaderTitle}
      extra={FilterInput}
      bordered={false}
    >
      {loading ? LoadingSkeleton : WatchlistTable()}
    </Card>
  )
}

export default WatchlistCard
