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
import React, { useRef, useEffect } from 'react'

import successNotification from '@helpers/successNotification'

import { useSelfUserTransactionUpsert } from '@hooks/api/mutations/useSelfUserTransactionUpsert'

import { SuccessMessage } from '@lib/messages'
import UserTransaction, {
  UserTransactionCategory,
  UserTransactionType,
  UserTransactionFrequency,
} from '@lib/userTransaction'

interface UserTransactionBalanceModalProps {
  transaction?: UserTransaction
  frequency?: UserTransactionFrequency
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh: () => void
}

interface TransactionFormType {
  label?: string
  value?: number
  type?: UserTransactionType
  category?: UserTransactionCategory
}

const UserTransactionModal = ({
  transaction,
  frequency,
  isVisible,
  setIsVisible,
  triggerRefresh,
}: UserTransactionBalanceModalProps) => {
  const form = useRef<FormInstance<TransactionFormType>>()
  const { selfUserTransactionUpsert, selfUserTransactionUpsertLoading } =
    useSelfUserTransactionUpsert()

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleSubmit = async ({
    value,
    label,
    type,
    category,
  }: TransactionFormType) => {
    const inputs: Partial<UserTransaction> = {
      id: transaction?.id,
      name: label,
      value,
      type,
      category,
      frequency,
    }
    await selfUserTransactionUpsert({
      variables: { inputs },
    })
    handleClose()
    triggerRefresh()
    successNotification(
      transaction?.id
        ? SuccessMessage.transactionUpdate
        : SuccessMessage.transactionCreation,
      transaction?.name
    )
  }

  const handleDelete = async () => {
    const inputs: Partial<UserTransaction> = {
      id: transaction?.id,
      deletedAt: new Date().toISOString(),
    }
    await selfUserTransactionUpsert({
      variables: { inputs },
    })
    handleClose()
    triggerRefresh()
    successNotification(SuccessMessage.transactionDeletion, transaction.name)
  }

  useEffect(() => {
    form.current?.setFieldsValue({
      label: transaction?.name,
      value: transaction?.value,
      type: transaction?.type,
      category: transaction?.category,
    })
  }, [transaction])

  return (
    <Modal
      className="user-transaction-balance-modal"
      title="Transaction"
      open={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        ref={form}
        name="user-transaction-balance-form"
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Label"
              name="label"
              rules={[
                {
                  required: true,
                  message: 'Please input a label',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Amount"
              name="value"
              rules={[
                {
                  required: true,
                  message: 'Please input an amount',
                },
              ]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true }]}
          initialValue="expense"
        >
          <Radio.Group>
            <Radio.Button value="income">Income</Radio.Button>
            <Radio.Button value="expense">Expense</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true }]}
          initialValue="extra"
        >
          <Radio.Group>
            <Radio.Button value="rent">Rent</Radio.Button>
            <Radio.Button value="groceries">Groceries</Radio.Button>
            <Radio.Button value="subscription">Subscription</Radio.Button>
            <Radio.Button value="extra">Extra</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item style={{ marginBottom: '0', marginTop: '12px' }}>
          <Row gutter={16}>
            <Col span={transaction ? 12 : 24}>
              <Button
                type="default"
                size="large"
                loading={selfUserTransactionUpsertLoading}
                htmlType="submit"
                style={{ width: '100%' }}
                icon={<CheckOutlined />}
              />
            </Col>
            {transaction && (
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
                    loading={selfUserTransactionUpsertLoading}
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

export default UserTransactionModal
