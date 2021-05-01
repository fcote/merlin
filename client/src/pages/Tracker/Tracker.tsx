import { SyncOutlined } from '@ant-design/icons'
import { Button, Col, PageHeader, Row, Space } from 'antd'
import { chunk, range } from 'lodash'
import React, { useState, useMemo } from 'react'

import HeaderAddButton from '@components/buttons/HeaderAddButton/HeaderAddButton'
import TrackerCard from '@components/cards/TrackerCard/TrackerCard'
import FollowedSecurityGroupModal from '@components/modals/FollowedSecurityGroupModal/FollowedSecurityGroupModal'
import FollowedSecurityModal, {
  FollowedSecurityModalItem,
} from '@components/modals/FollowedSecurityModal/FollowedSecurityModal'

import successNotification from '@helpers/successNotification'

import { useSecuritySyncPrices } from '@hooks/api/mutations/useSecuritySyncPrices'
import { useSelfFollowedSecurityGroups } from '@hooks/api/queries/useSelfFollowedSecurityGroups'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import FollowedSecurityGroup, {
  FollowedSecurityGroupType,
} from '@lib/followedSecurityGroup'
import { SuccessMessage } from '@lib/messages'

import './Tracker.style.less'

const Tracker = () => {
  useDocumentTitle('Tracker')

  const { data: rawTrackers, loading, refetch } = useSelfFollowedSecurityGroups(
    FollowedSecurityGroupType.tracker
  )
  const {
    securitySyncPrices,
    securitySyncPricesLoading,
  } = useSecuritySyncPrices()

  const [isTrackerModalVisible, setIsTrackerModalVisible] = useState(false)
  const [isTrackerItemModalVisible, setIsTrackerItemModalVisible] = useState(
    false
  )
  const [currentTrackerId, setCurrentTrackerId] = useState<string>(null)
  const [
    currentTrackerItem,
    setCurrentTrackerItem,
  ] = useState<FollowedSecurityModalItem>(null)

  const trackers = useMemo(() => {
    if (loading)
      return range(6).map(
        (i) => ({ id: i.toString() } as FollowedSecurityGroup)
      )
    return rawTrackers
  }, [rawTrackers, loading])

  const handleSyncPrices = async () => {
    await securitySyncPrices({
      variables: {
        tickers: trackers.flatMap((t) =>
          t.followedSecurities.nodes.map((s) => s.security.ticker)
        ),
      },
    })
    await refetch({})
    successNotification(SuccessMessage.pricesSync)
  }

  const HeaderTitle = (
    <Space align="center">
      <div>Tracker</div>
      <HeaderAddButton handleAdd={() => setIsTrackerModalVisible(true)} />
    </Space>
  )

  const GroupCards =
    chunk(trackers, 6).map((groups, index) => {
      const columns = groups.map((tracker) => (
        <Col key={tracker.id} span={4}>
          <TrackerCard
            tracker={tracker}
            setCurrentTrackerId={setCurrentTrackerId}
            setCurrentTrackerItem={setCurrentTrackerItem}
            setIsTrackerItemModalVisible={setIsTrackerItemModalVisible}
            loading={loading}
          />
        </Col>
      ))

      return (
        <Row key={index} gutter={8}>
          {columns}
        </Row>
      )
    }) ?? []

  const SyncButton = () => {
    if (!trackers?.length) return null

    return (
      <Button
        key="sync-button"
        loading={securitySyncPricesLoading}
        onClick={handleSyncPrices}
        icon={<SyncOutlined />}
      />
    )
  }

  return (
    <div className="tracker">
      <FollowedSecurityGroupModal
        triggerRefresh={refetch}
        isVisible={isTrackerModalVisible}
        setIsVisible={setIsTrackerModalVisible}
        type={FollowedSecurityGroupType.tracker}
      />
      <FollowedSecurityModal
        followedSecurityItem={currentTrackerItem}
        followedSecurityGroupId={currentTrackerId}
        triggerRefresh={refetch}
        isVisible={isTrackerItemModalVisible}
        setIsVisible={setIsTrackerItemModalVisible}
      />
      <PageHeader title={HeaderTitle} extra={SyncButton()} />
      <br />
      {GroupCards}
    </div>
  )
}

export default Tracker
