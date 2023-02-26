import { CheckOutlined } from '@ant-design/icons'
import {
  Modal,
  Form,
  Input,
  Button,
  FormInstance,
  notification,
  InputNumber,
} from 'antd'
import React, { useRef } from 'react'

import {
  useSelfFollowedSecurityGroupUpsert,
  FollowedSecurityGroupInputs,
} from '@hooks/api/mutations/useSelfFollowedSecurityGroupUpsert'

import { FollowedSecurityGroupType } from '@lib/followedSecurityGroup'

interface FollowedSecurityGroupModalProps {
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh: () => void
  type: FollowedSecurityGroupType
}

interface FollowedSecurityGroupFormType {
  name: string
  index: string
}

const FollowedSecurityGroupModal = ({
  isVisible,
  setIsVisible,
  triggerRefresh,
  type,
}: FollowedSecurityGroupModalProps) => {
  const form = useRef<FormInstance<FollowedSecurityGroupFormType>>()
  const {
    selfFollowedSecurityGroupUpsert,
    selfFollowedSecurityGroupUpsertLoading,
  } = useSelfFollowedSecurityGroupUpsert()

  const showSuccessNotification = () => {
    notification.success({
      message: `Group successfully added`,
      description: form.current.getFieldValue('name'),
      placement: 'bottomRight',
    })
  }

  const handleClose = () => {
    form.current.resetFields()
    triggerRefresh()
    setIsVisible(false)
  }

  const handleSync = async ({ name, index }: FollowedSecurityGroupFormType) => {
    const inputs: FollowedSecurityGroupInputs = {
      name,
      index: Number(index),
      type,
    }
    await selfFollowedSecurityGroupUpsert({
      variables: { inputs },
    })
    showSuccessNotification()
    handleClose()
  }

  return (
    <Modal
      className="followed-security-group-modal"
      title={`New ${type}`}
      open={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        ref={form}
        name="followed-security-group-form"
        layout="vertical"
        onFinish={handleSync}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input a name',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Position"
          name="index"
          rules={[
            {
              required: true,
              message: 'Please input a position',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: '0', marginTop: '12px' }}>
          <Button
            style={{ width: '100%' }}
            type="default"
            size="large"
            loading={selfFollowedSecurityGroupUpsertLoading}
            htmlType="submit"
            icon={<CheckOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FollowedSecurityGroupModal
