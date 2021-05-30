import { DeleteOutlined } from '@ant-design/icons'
import { Modal, Button } from 'antd'
import { omit } from 'lodash'
import numeral from 'numeral'
import React, { useState, useEffect } from 'react'

import EditableTable, {
  EditableColumn,
  EditableRecord,
} from '@components/tables/EditableTable/EditableTable'

import { dayjs } from '@helpers/dayjs'
import { getNextKey } from '@helpers/getNextKey'

import { useSelfUserTransactionUpsert } from '@hooks/api/mutations/useSelfUserTransactionUpsert'

import UserTransaction, {
  UserTransactionType,
  UserTransactionFrequency,
  UserTransactionCategory,
} from '@lib/userTransaction'

import './UserTransactionTableModal.style.less'

export interface UserTransactionModalProps {
  transactions: UserTransaction[]
  date: string
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh?: () => void
}

export type UserTransactionItem = Omit<UserTransaction, 'value' | 'userId'> &
  EditableRecord & {
    key: string
    value: string
  }

const UserTransactionTableModal = ({
  transactions,
  date,
  isVisible,
  setIsVisible,
  triggerRefresh,
}: UserTransactionModalProps) => {
  const { selfUserTransactionUpsert } = useSelfUserTransactionUpsert()
  const [formattedTransactions, setFormattedTransactions] = useState<
    UserTransactionItem[]
  >([])

  const transactionToItem = (
    transaction: UserTransaction
  ): UserTransactionItem => ({
    ...transaction,
    key: transaction.id.toString(),
    value: transaction.value?.toString(),
    editable: { name: true, value: true },
    editing: false,
  })

  const itemToTransaction = (item: UserTransactionItem): UserTransaction => {
    const value = numeral(item.value).value()
    return {
      ...omit(item, ['key', 'editing', 'editable']),
      value,
    }
  }

  useEffect(() => {
    const filteredTransactions = transactions?.filter((t) => {
      const modalDate = dayjs.utc(date).startOf('month')
      const transactionDate = dayjs.utc(t.date).startOf('month')
      return modalDate.diff(transactionDate, 'month') === 0
    })
    setFormattedTransactions(filteredTransactions?.map(transactionToItem))
  }, [transactions, date])

  const handleClose = () => {
    setFormattedTransactions(formattedTransactions.filter((t) => t.id))
    setIsVisible(false)
  }

  const handleSave = async (record: UserTransactionItem) => {
    const inputs: UserTransaction = itemToTransaction(record)
    const transaction = await selfUserTransactionUpsert({
      variables: { inputs },
    })
    if (!transaction) return
    const index = formattedTransactions.findIndex((t) => t.key === record.key)
    if (index >= 0) {
      formattedTransactions[index] = transactionToItem(transaction)
    } else {
      formattedTransactions.push(transactionToItem(transaction))
    }
    setFormattedTransactions([...formattedTransactions])
    triggerRefresh()
  }

  const handleDelete = async (record: UserTransactionItem) => {
    const inputs: UserTransaction = itemToTransaction(record)
    inputs.deletedAt = new Date().toISOString()
    await selfUserTransactionUpsert({
      variables: { inputs },
    })
    setFormattedTransactions([
      ...formattedTransactions.filter((t) => t.key !== record.key),
    ])
    triggerRefresh()
  }

  const defaultTransaction = (): UserTransactionItem => ({
    key: getNextKey(formattedTransactions),
    name: '',
    value: '',
    type: UserTransactionType.expense,
    frequency: UserTransactionFrequency.punctual,
    category: UserTransactionCategory.extra,
    date: dayjs.utc(date).toISOString(),
    editable: { name: true, value: true },
    editing: true,
  })

  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      width: '50%',
      editable: true,
      required: true,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      align: 'left',
      width: '40%',
      editable: true,
      required: true,
    },
    {
      title: '',
      dataIndex: 'operation',
      editable: false,
      required: false,
      width: '10%',
      render: (_, record: UserTransactionItem) => (
        <Button
          onClick={() => handleDelete(record)}
          type="link"
          icon={<DeleteOutlined />}
        />
      ),
    },
  ]

  return (
    <Modal
      className="user-transaction-modal"
      title={dayjs(date).format('MMMM YY')}
      visible={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <EditableTable
        showDivider={true}
        columns={columns}
        items={formattedTransactions}
        defaultItem={defaultTransaction}
        handleSave={handleSave}
        emptyText="No transactions"
        showHeaders={true}
      />
    </Modal>
  )
}

export default UserTransactionTableModal
