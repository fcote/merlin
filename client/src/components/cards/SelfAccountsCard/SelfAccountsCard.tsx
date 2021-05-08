import { SyncOutlined, PlusOutlined } from '@ant-design/icons'
import { Statistic, Button, Dropdown, Menu } from 'antd'
import { ColumnType } from 'antd/lib/table'
import React, { useState, useEffect, MouseEvent } from 'react'

import UserFinancialCard, {
  UserFinancialItem,
} from '@components/cards/UserFinancialCard/UserFinancialCard'
import UserAccountModal from '@components/modals/UserAccountModal/UserAccountModal'
import UserAccountSyncModal from '@components/modals/UserAccountSyncModal/UserAccountSyncModal'

import { formatValue, ValueType } from '@helpers/formatValue'
import successNotification from '@helpers/successNotification'

import {
  useSelfUserAccountSync,
  UserAccountSyncInputs,
} from '@hooks/api/mutations/useSelfUserAccountSync'

import { SuccessMessage } from '@lib/messages'
import UserAccount from '@lib/userAccount'

interface UserAccountsCardProps {
  accounts: UserAccount[]
  totalBalance: number
  currency: string
  refetch: () => void
  loading: boolean
}

const SelfAccountsCard: React.FC<UserAccountsCardProps> = ({
  accounts,
  totalBalance,
  currency,
  refetch,
  loading,
}) => {
  const {
    selfUserAccountSync,
    selfUserAccountSyncLoading,
    getCredentials,
  } = useSelfUserAccountSync()
  const [formattedAccounts, setFormattedAccounts] = useState<
    UserFinancialItem<UserAccount>[]
  >([])
  const [accountModalInstance, setAccountModalInstance] = useState<UserAccount>(
    null
  )
  const [isAccountModalVisible, setIsAccountModalVisible] = useState<boolean>(
    false
  )
  const [
    isAccountLoginModalVisible,
    setIsAccountLoginModalVisible,
  ] = useState<boolean>(false)

  useEffect(() => {
    if (!accounts) return

    setFormattedAccounts(
      accounts.map((a) => ({
        key: a.id.toString(),
        label: a.name,
        value: formatValue(a.balance, ValueType.amount, currency),
        instance: a,
      }))
    )
  }, [accounts])

  const handleSync = async (e: MouseEvent, account: UserAccount) => {
    e.stopPropagation()
    const credentials = getCredentials(account.id)

    if (credentials) {
      const inputs: UserAccountSyncInputs = {
        id: account.id,
        ...credentials,
      }
      await selfUserAccountSync({
        variables: { inputs },
      })
      refetch()
      successNotification(SuccessMessage.accountSync, account.name)
      return
    }

    setAccountModalInstance(account)
    setIsAccountLoginModalVisible(true)
  }

  const onAccountClick = (r: UserFinancialItem<UserAccount>) => () => {
    setAccountModalInstance(r.instance)
    setIsAccountModalVisible(true)
  }

  const columns: ColumnType<any>[] = [
    {
      dataIndex: 'label',
      align: 'left',
      render: (_, record) => {
        return (
          <span>
            {record.label}
            {record.instance.provider && (
              <Button
                onClick={(e) => handleSync(e, record.instance)}
                type="link"
                loading={selfUserAccountSyncLoading}
                icon={<SyncOutlined />}
                style={{ marginLeft: 8, background: 'transparent' }}
              />
            )}
          </span>
        )
      },
    },
    { dataIndex: 'value', align: 'right' },
  ]

  const ContextMenu = (
    <Menu>
      <Menu.Item
        key="add-account"
        onClick={() => {
          setAccountModalInstance(null)
          setIsAccountModalVisible(true)
        }}
        icon={<PlusOutlined />}
      >
        New account
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="self-accounts-section">
      <UserAccountModal
        account={accountModalInstance}
        isVisible={isAccountModalVisible}
        setIsVisible={setIsAccountModalVisible}
        triggerRefresh={refetch}
      />
      <UserAccountSyncModal
        accountId={accountModalInstance?.id}
        accountLabel={accountModalInstance?.name}
        triggerRefresh={refetch}
        isVisible={isAccountLoginModalVisible}
        setIsVisible={setIsAccountLoginModalVisible}
      />
      <Dropdown overlay={ContextMenu} trigger={['contextMenu']}>
        <div>
          <UserFinancialCard
            title="Accounts"
            extra={
              <Statistic
                value={totalBalance}
                precision={0}
                groupSeparator=""
                valueStyle={{ color: '#a9d134' }}
                suffix={currency}
              />
            }
            columns={columns}
            items={formattedAccounts}
            onRowClick={onAccountClick}
            loading={loading}
            emptyText="No accounts"
          />
        </div>
      </Dropdown>
    </div>
  )
}

export default SelfAccountsCard
