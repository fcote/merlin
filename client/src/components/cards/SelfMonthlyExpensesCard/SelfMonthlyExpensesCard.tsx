import { PlusOutlined } from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'
import React, { useState, useEffect } from 'react'

import UserFinancialCard, {
  UserFinancialItem,
} from '@components/cards/UserFinancialCard/UserFinancialCard'
import UserTransactionModal from '@components/modals/UserTransactionModal/UserTransactionModal'

import { formatValue, ValueType } from '@helpers/formatValue'

import UserTransaction, { UserTransactionFrequency } from '@lib/userTransaction'

interface SelfMonthlyExpensesCardProps {
  monthlyExpenses: UserTransaction[]
  currency: string
  refetch: () => void
  loading: boolean
}

const SelfMonthlyExpensesCard: React.FC<SelfMonthlyExpensesCardProps> = ({
  monthlyExpenses,
  currency,
  loading,
  refetch,
}) => {
  const [
    transactionModalInstance,
    setTransactionModalInstance,
  ] = useState<UserTransaction>(null)
  const [
    isTransactionModalVisible,
    setIsTransactionModalVisible,
  ] = useState<boolean>(false)
  const [
    monthlyExpensesTransactions,
    setMonthlyExpensesTransactions,
  ] = useState<UserFinancialItem[]>([])

  const onTransactionClick = (r?: UserFinancialItem<UserTransaction>) => () => {
    setTransactionModalInstance(r?.instance)
    setIsTransactionModalVisible(true)
  }

  useEffect(() => {
    if (!monthlyExpenses) return

    setMonthlyExpensesTransactions(
      monthlyExpenses.map((t) => ({
        key: t.id.toString(),
        label: t.name,
        value: formatValue(t.value, ValueType.amount, currency),
        editing: false,
        editable: { label: true, value: true },
        instance: t,
      }))
    )
  }, [monthlyExpenses])

  const ContextMenu = (
    <Menu>
      <Menu.Item
        key="add-transaction"
        onClick={() => {
          setTransactionModalInstance(null)
          setIsTransactionModalVisible(true)
        }}
        icon={<PlusOutlined />}
      >
        New monthly expense
      </Menu.Item>
    </Menu>
  )

  return (
    <div>
      <UserTransactionModal
        isVisible={isTransactionModalVisible}
        setIsVisible={setIsTransactionModalVisible}
        frequency={UserTransactionFrequency.monthly}
        transaction={transactionModalInstance}
        triggerRefresh={refetch}
      />
      <Dropdown overlay={ContextMenu} trigger={['contextMenu']}>
        <div>
          <UserFinancialCard
            title="Monthly expenses"
            items={monthlyExpensesTransactions}
            loading={loading}
            emptyText={
              <div>
                <div>No monthly expenses</div>
                <div>Right click to create your first monthly transaction</div>
              </div>
            }
            onRowClick={onTransactionClick}
          />
        </div>
      </Dropdown>
    </div>
  )
}

export default SelfMonthlyExpensesCard
