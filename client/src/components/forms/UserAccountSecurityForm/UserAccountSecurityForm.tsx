import { Form, Input, InputNumber, Button, FormInstance, Row, Col } from 'antd'
import React, { useRef, useEffect } from 'react'

import DatePicker from '@components/DatePicker'
import UserAccountSelect from '@components/inputs/UserAccountSelect/UserAccountSelect'

import { dayjs } from '@helpers/dayjs'

import {
  useSelfUserAccountSecurityUpsert,
  UserAccountSecurityInputs,
} from '@hooks/api/mutations/useSelfUserAccountSecurityUpsert'

import { UserAccountType } from '@lib/userAccount'
import UserAccountSecurity from '@lib/userAccountSecurity'

export type UserAccountSecurityFormProps = {
  ticker: string
  selectedAccountSecurity: UserAccountSecurity
  onChangeSelectedAccountSecurity?: (
    accountSecurity: UserAccountSecurity
  ) => void
  triggerRefresh: () => void
  userCurrency: string
}

type UserAccountSecurityFormType = {
  openPrice: number
  openedAt: dayjs.Dayjs
  volume: number
  currency: string
  userAccountId: string
}

const UserAccountSecurityForm: React.FC<UserAccountSecurityFormProps> = ({
  ticker,
  selectedAccountSecurity,
  onChangeSelectedAccountSecurity,
  triggerRefresh,
  userCurrency,
}) => {
  const form = useRef<FormInstance<UserAccountSecurityFormType>>()

  const {
    selfUserAccountSecurityUpsert,
    selfUserAccountSecurityUpsertLoading,
  } = useSelfUserAccountSecurityUpsert()

  const defaultFields = (): UserAccountSecurityFormType => ({
    openPrice: null,
    openedAt: dayjs(),
    volume: null,
    currency: userCurrency,
    userAccountId: null,
  })

  const resetForm = () => {
    form.current?.setFieldsValue(defaultFields())
  }

  const handleSubmit = async ({
    openPrice,
    openedAt,
    volume,
    currency,
    userAccountId,
  }: UserAccountSecurityFormType) => {
    const inputs: Partial<UserAccountSecurityInputs> = {
      ...(selectedAccountSecurity && { id: selectedAccountSecurity.id }),
      openPrice,
      openedAt: openedAt.toISOString(),
      volume,
      currency,
      name: ticker,
      securityTicker: ticker,
      userAccountId,
    }
    await selfUserAccountSecurityUpsert({
      variables: { inputs },
    })
    triggerRefresh()
    onChangeSelectedAccountSecurity?.(null)
  }

  useEffect(() => {
    resetForm()
  }, [ticker])

  useEffect(() => {
    if (!selectedAccountSecurity) {
      resetForm()
      return
    }

    form.current?.setFieldsValue({
      openPrice: selectedAccountSecurity.openPrice,
      openedAt: dayjs(selectedAccountSecurity.openedAt),
      volume: selectedAccountSecurity.volume,
      currency: selectedAccountSecurity.currency,
      userAccountId: selectedAccountSecurity.userAccountId,
    })
  }, [selectedAccountSecurity])

  const FormActions = () => {
    const submitButtonSpan = selectedAccountSecurity ? 12 : 24
    const submitTitle = selectedAccountSecurity ? 'Edit' : 'Add'

    const ClearButton = selectedAccountSecurity && (
      <Col span={12}>
        <Button
          onClick={() => onChangeSelectedAccountSecurity(null)}
          size="large"
          style={{ width: '100%' }}
        >
          Clear
        </Button>
      </Col>
    )

    return (
      <Row gutter={16}>
        <Col span={submitButtonSpan}>
          <Button
            type="default"
            size="large"
            loading={selfUserAccountSecurityUpsertLoading}
            htmlType="submit"
            style={{ width: '100%' }}
          >
            {submitTitle}
          </Button>
        </Col>
        {ClearButton}
      </Row>
    )
  }

  return (
    <Form
      ref={form}
      name="user-account-security-form-form"
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label="Open price"
            name="openPrice"
            rules={[
              {
                required: true,
                message: '',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Currency"
            name="currency"
            rules={[
              {
                required: true,
                message: '',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Opened at"
        name="openedAt"
        rules={[
          {
            required: true,
            message: '',
          },
        ]}
      >
        <DatePicker showTime style={{ width: '100%' }} placeholder="" />
      </Form.Item>

      <Form.Item
        label="Volume"
        name="volume"
        rules={[
          {
            required: true,
            message: '',
          },
        ]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Account"
        name="userAccountId"
        rules={[
          {
            required: true,
            message: '',
          },
        ]}
      >
        <UserAccountSelect type={UserAccountType.securities} />
      </Form.Item>

      <Form.Item style={{ marginBottom: '0', marginTop: '12px' }}>
        {FormActions()}
      </Form.Item>
    </Form>
  )
}

export default UserAccountSecurityForm
