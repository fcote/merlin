import { PlusOutlined, SisternodeOutlined } from '@ant-design/icons'
import { Dropdown, Menu, Empty } from 'antd'
import React, { useState, useMemo, useEffect } from 'react'

import WatchlistCard from '@components/cards/WatchlistCard/WatchlistCard'
import FollowedSecurityGroupModal from '@components/modals/FollowedSecurityGroupModal/FollowedSecurityGroupModal'

import {
  useSelfFollowedSecurityGroups,
  subscribeToMoreFollowedSecurityGroupPrices,
} from '@hooks/api/queries/useSelfFollowedSecurityGroups'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import FollowedSecurityGroup, {
  FollowedSecurityGroupType,
} from '@lib/followedSecurityGroup'

import './Watchlist.style.less'

const Watchlist = () => {
  useDocumentTitle('Watchlist')
  const [subscribed, setSubscribed] = useState<boolean>(false)

  const {
    data: rawWatchlists,
    loading,
    refetch,
    subscribeToMore,
  } = useSelfFollowedSecurityGroups(FollowedSecurityGroupType.watchlist)
  const [isWatchlistModalVisible, setIsWatchlistModalVisible] = useState(false)

  const contextMenu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => setIsWatchlistModalVisible(true)}
        icon={<PlusOutlined />}
      >
        New watchlist
      </Menu.Item>
    </Menu>
  )

  const watchlists = useMemo(() => {
    return loading ? [{} as FollowedSecurityGroup] : rawWatchlists
  }, [loading, rawWatchlists])

  const WatchlistCards = watchlists?.map(
    (w: FollowedSecurityGroup, i: number) => {
      return (
        <div key={w.id ?? i} className="watchlist-table-container">
          <WatchlistCard
            watchlist={w}
            triggerRefresh={refetch}
            loading={loading}
          />
        </div>
      )
    }
  )

  useEffect(() => {
    if (!subscribeToMore || subscribed || !rawWatchlists?.length) return

    const tickers = watchlists.flatMap((w) =>
      w.followedSecurities.nodes.map((fs) => fs.security.ticker)
    )
    subscribeToMore(subscribeToMoreFollowedSecurityGroupPrices(tickers))
    setSubscribed(true)
  }, [watchlists])

  const Helper = (
    <Empty
      image={<SisternodeOutlined style={{ fontSize: 72 }} />}
      description="Right click to create your first watchlist"
      style={{ paddingTop: '30vh' }}
    />
  )

  return (
    <div className="watchlist">
      <FollowedSecurityGroupModal
        triggerRefresh={refetch}
        isVisible={isWatchlistModalVisible}
        setIsVisible={setIsWatchlistModalVisible}
        type={FollowedSecurityGroupType.watchlist}
      />
      <Dropdown overlay={contextMenu} trigger={['contextMenu']}>
        <div
          className="watchlist-content"
          style={{ height: 'calc(100vh - 100px)' }}
        >
          {WatchlistCards.length || loading ? WatchlistCards : Helper}
        </div>
      </Dropdown>
    </div>
  )
}

export default Watchlist
