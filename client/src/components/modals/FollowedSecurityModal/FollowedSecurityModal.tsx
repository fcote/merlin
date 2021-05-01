import {
  CheckOutlined,
  DeleteOutlined,
  SearchOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import {
  Modal,
  Form,
  Button,
  FormInstance,
  AutoComplete,
  Input,
  Spin,
  Row,
  Col,
  Popconfirm,
  InputNumber,
} from 'antd'
import { debounce, isEmpty } from 'lodash'
import React, { useRef, useEffect, useMemo } from 'react'

import successNotification from '@helpers/successNotification'

import useSecurityGetOrSync from '@hooks/api/mutations/useSecurityGetOrSync'
import {
  useSelfFollowedSecurityLink,
  FollowedSecurityLinkInputs,
} from '@hooks/api/mutations/useSelfFollowedSecurityLink'
import {
  useSelfFollowedSecurityUnlink,
  FollowedSecurityUnlinkInputs,
} from '@hooks/api/mutations/useSelfFollowedSecurityUnlink'
import { useSecuritySearch } from '@hooks/api/queries/useSecuritySearch'

import { SuccessMessage } from '@lib/messages'

interface FollowedSecurityModalProps {
  followedSecurityItem?: FollowedSecurityModalItem
  followedSecurityGroupId: string
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh: () => void
}

interface FollowedSecurityFormType {
  ticker: string
  alias: string
  index: string
}

export interface FollowedSecurityModalItem {
  ticker: string
  alias: string
  index: number
  securityId: string
}

const FollowedSecurityModal = ({
  followedSecurityItem,
  followedSecurityGroupId,
  isVisible,
  setIsVisible,
  triggerRefresh,
}: FollowedSecurityModalProps) => {
  const form = useRef<FormInstance<FollowedSecurityFormType>>()
  const { securitySearch, securitySearchResults, loading } = useSecuritySearch()
  const { getOrSyncSecurity, securityLoading } = useSecurityGetOrSync()
  const {
    selfFollowedSecurityLink,
    selfFollowedSecurityLinkLoading,
  } = useSelfFollowedSecurityLink()
  const { selfFollowedSecurityUnlink } = useSelfFollowedSecurityUnlink()

  const searchItems = useMemo(() => {
    if (!securitySearchResults?.length) return []

    return securitySearchResults.map((r) => ({
      value: r.ticker,
      label: `${r.ticker} (${r.name})`,
    }))
  }, [securitySearchResults])

  const handleClose = () => {
    form.current.resetFields()
    setIsVisible(false)
  }

  const handleSearch = async (ticker: string) => {
    if (isEmpty(ticker)) {
      return
    }

    await securitySearch({
      variables: { ticker: ticker.toUpperCase() },
    })
  }

  const handleSubmit = async ({
    ticker,
    alias,
    index,
  }: FollowedSecurityFormType) => {
    const security = !followedSecurityItem && (await getOrSyncSecurity(ticker))

    const inputs: FollowedSecurityLinkInputs = {
      alias,
      index: Number(index),
      securityId: followedSecurityItem?.securityId ?? security.id,
      followedSecurityGroupId,
    }
    await selfFollowedSecurityLink({
      variables: { inputs },
    })

    successNotification(SuccessMessage.addTrackerItem, ticker)
    triggerRefresh()
    handleClose()
  }

  const handleDelete = async () => {
    const inputs: FollowedSecurityUnlinkInputs = {
      securityId: followedSecurityItem.securityId,
      followedSecurityGroupId,
    }
    await selfFollowedSecurityUnlink({
      variables: { inputs },
    })
    successNotification(
      SuccessMessage.deleteTrackerItem,
      followedSecurityItem.alias
    )
    triggerRefresh()
    handleClose()
  }

  useEffect(() => {
    if (!followedSecurityItem) {
      form.current?.resetFields()
      return
    }

    form.current?.setFieldsValue({
      ticker: followedSecurityItem.ticker,
      alias: followedSecurityItem.alias,
      index: followedSecurityItem.index.toString(),
    })
  }, [followedSecurityItem])

  return (
    <Modal
      className="followed-security-modal"
      title={
        followedSecurityItem
          ? `Edit - ${followedSecurityItem.alias}`
          : 'New item'
      }
      visible={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        ref={form}
        name="followed-security-modal-form"
        onFinish={handleSubmit}
      >
        {!followedSecurityItem && (
          <Form.Item
            name="ticker"
            rules={[
              {
                required: true,
                message: 'Please input a search',
              },
            ]}
          >
            <AutoComplete
              options={searchItems}
              onSearch={debounce(handleSearch, 300)}
            >
              <Input
                size="large"
                placeholder="Search ticker"
                prefix={<SearchOutlined />}
                suffix={loading && <Spin indicator={<LoadingOutlined />} />}
              />
            </AutoComplete>
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={18}>
            <Form.Item name="alias">
              <Input placeholder="Alias" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="index">
              <InputNumber placeholder="Position" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: '0' }}>
          <Row gutter={16}>
            <Col span={followedSecurityItem ? 12 : 24}>
              <Button
                type="default"
                size="large"
                loading={securityLoading || selfFollowedSecurityLinkLoading}
                htmlType="submit"
                style={{ width: '100%' }}
                icon={<CheckOutlined />}
              />
            </Col>
            {followedSecurityItem && (
              <Col span={12}>
                <Popconfirm
                  title="Confirm"
                  okType="default"
                  icon={null}
                  onConfirm={handleDelete}
                >
                  <Button
                    type="dashed"
                    danger
                    size="large"
                    loading={securityLoading || selfFollowedSecurityLinkLoading}
                    style={{ width: '100%' }}
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Col>
            )}
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FollowedSecurityModal
