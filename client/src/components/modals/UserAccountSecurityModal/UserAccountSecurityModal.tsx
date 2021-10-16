import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import { Col, Modal, Row, Table, Button, Divider } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useState } from 'react'

import UserAccountSecurityForm from '@components/forms/UserAccountSecurityForm/UserAccountSecurityForm'
import TickerAutocomplete from '@components/inputs/TickerAutocomplete/TickerAutocomplete'

import { dayjs } from '@helpers/dayjs'

import { useSelfUserAccountSecurityUpsert } from '@hooks/api/mutations/useSelfUserAccountSecurityUpsert'
import { useSelfUserAccountSecurities } from '@hooks/api/queries/useSelfUserAccountSecurities'

import UserAccountSecurity from '@lib/userAccountSecurity'

export interface UserAccountSecurityModalProps {
  ticker: string
  onTickerChange: (ticker: string) => void
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  userCurrency: string
  triggerRefresh: () => void
}

const UserAccountSecurityModal = ({
  ticker,
  onTickerChange,
  isVisible,
  setIsVisible,
  userCurrency,
  triggerRefresh,
}: UserAccountSecurityModalProps) => {
  const [selectedAccountSecurity, setSelectedAccountSecurity] =
    useState<UserAccountSecurity>()

  const {
    data: accountSecurities,
    loading: accountSecuritiesLoading,
    refetch,
  } = useSelfUserAccountSecurities(ticker)
  const {
    selfUserAccountSecurityUpsert,
    selfUserAccountSecurityUpsertLoading,
  } = useSelfUserAccountSecurityUpsert()

  const handleClose = () => {
    onTickerChange(null)
    setSelectedAccountSecurity(null)
    setIsVisible(false)
  }

  const handleRefresh = async () => {
    await refetch({
      filters: { ticker },
    })
    triggerRefresh()
  }

  const handleDelete = async (record: UserAccountSecurity) => {
    await selfUserAccountSecurityUpsert({
      variables: {
        inputs: {
          id: record.id,
          deletedAt: dayjs().toISOString(),
        },
      },
    })
    await handleRefresh()
  }

  const accountSecurityColumns: ColumnsType<UserAccountSecurity> = [
    { title: 'Volume', dataIndex: 'volume', align: 'left' },
    { title: 'Open price', dataIndex: 'openPrice', align: 'left' },
    { title: 'Currency', dataIndex: 'currency', align: 'left' },
    {
      title: '',
      dataIndex: 'operation',
      align: 'right',
      render: (_, record) => [
        <Button
          key="edit-user-account-security"
          onClick={() => setSelectedAccountSecurity(record)}
          icon={<EditOutlined />}
          style={{ marginRight: 8 }}
        />,
        <Button
          key="remove-user-account-security"
          onClick={() => handleDelete(record)}
          loading={selfUserAccountSecurityUpsertLoading}
          icon={<CloseOutlined />}
        />,
      ],
    },
  ]

  const UserAccountTransfer = () => {
    if (!ticker) return

    return (
      <div className="user-account-transfer">
        <Divider />
        <Row gutter={36}>
          <Col span={12}>
            <Table
              size="small"
              loading={accountSecuritiesLoading}
              dataSource={accountSecurities}
              columns={accountSecurityColumns}
              pagination={false}
              locale={{ emptyText: 'No positions' }}
            />
          </Col>
          <Col span={12}>
            <UserAccountSecurityForm
              triggerRefresh={handleRefresh}
              ticker={ticker}
              selectedAccountSecurity={selectedAccountSecurity}
              onChangeSelectedAccountSecurity={setSelectedAccountSecurity}
              userCurrency={userCurrency}
            />
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <Modal
      width={1000}
      className="user-account-security-modal"
      visible={isVisible}
      footer={null}
      closable={false}
      closeIcon={null}
      onCancel={handleClose}
    >
      <TickerAutocomplete value={ticker} onChange={onTickerChange} />
      {UserAccountTransfer()}
    </Modal>
  )
}

export default UserAccountSecurityModal
