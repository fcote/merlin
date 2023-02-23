import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  Modal,
  Form,
  Input,
  Button,
  FormInstance,
  Radio,
  Col,
  Row,
  Popconfirm,
  InputNumber,
} from 'antd'
import { isEmpty } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import successNotification from '@helpers/successNotification'

import { useSelfUserAccountUpsert } from '@hooks/api/mutations/useSelfUserAccountUpsert'

import { SuccessMessage } from '@lib/messages'
import UserAccount, {
  UserAccountProvider,
  UserAccountType,
} from '@lib/userAccount'

interface UserAccountBalanceModalProps {
  account?: UserAccount
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh: () => void
}

interface UpdateBalanceFormType {
  name?: string
  type?: UserAccountType
  provider?: UserAccountProvider
  balance?: number
}

const UserAccountModal = ({
  account,
  isVisible,
  setIsVisible,
  triggerRefresh,
}: UserAccountBalanceModalProps) => {
  const form = useRef<FormInstance<UpdateBalanceFormType>>()
  const { selfUserAccountUpsert, selfUserAccountUpsertLoading } =
    useSelfUserAccountUpsert()

  const [isBalanceDisabled, setIsBalanceDisabled] = useState(false)

  useEffect(() => {
    form.current?.setFieldsValue({
      name: account?.name,
      type: account?.type,
      provider: account?.provider ?? ('' as UserAccountProvider),
      balance: account?.balance,
    })
    setIsBalanceDisabled(!!form.current?.getFieldValue('provider'))
  }, [account])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleSubmit = async ({
    balance,
    name,
    type,
    provider,
  }: UpdateBalanceFormType) => {
    const inputs: Partial<UserAccount> = {
      id: account?.id,
      name,
      type,
      provider: isEmpty(provider) ? null : provider,
      balance: Number(balance),
    }
    await selfUserAccountUpsert({
      variables: { inputs },
    })
    handleClose()
    triggerRefresh()
    successNotification(SuccessMessage.accountUpdate, account.name)
  }

  const handleDelete = async () => {
    const inputs: Partial<UserAccount> = {
      id: account?.id,
      deletedAt: new Date().toISOString(),
    }
    await selfUserAccountUpsert({
      variables: { inputs },
    })
    handleClose()
    triggerRefresh()
    successNotification(SuccessMessage.accountUpdate, account.name)
  }

  return (
    <Modal
      className="user-account-balance-modal"
      title={account?.name}
      open={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        ref={form}
        name="user-account-balance-form"
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
            <Form.Item
              label="Balance"
              name="balance"
              rules={[
                {
                  required: true,
                  message: 'Please input a balance',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                disabled={isBalanceDisabled}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Type" name="type" initialValue="saving">
              <Radio.Group>
                <Radio.Button value="saving">Saving</Radio.Button>
                <Radio.Button value="securities">Securities</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Provider" name="provider" initialValue="">
              <Radio.Group>
                <Radio.Button value="">Other</Radio.Button>
                <Radio.Button value="xtb">XTB</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: '0', marginTop: '12px' }}>
          <Row gutter={16}>
            <Col span={account ? 12 : 24}>
              <Button
                type="default"
                size="large"
                loading={selfUserAccountUpsertLoading}
                htmlType="submit"
                style={{ width: '100%' }}
                icon={<CheckOutlined />}
              />
            </Col>
            {account && (
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
                    loading={selfUserAccountUpsertLoading}
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

export default UserAccountModal
