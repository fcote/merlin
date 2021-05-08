import { Statistic } from 'antd'
import React, { useState, useEffect } from 'react'

import UserFinancialCard, {
  UserFinancialItem,
} from '@components/cards/UserFinancialCard/UserFinancialCard'

import { formatValue, ValueType } from '@helpers/formatValue'

import { useSelfUpdateUser } from '@hooks/api/mutations/useSelfUpdateUser'

import UserIncome, { UserIncomeItemLabel } from '@lib/userIncome'

interface SelfIncomeCardProps {
  income: UserIncome
  currency: string
  refetch: () => void
  loading: boolean
}

const SelfIncomeCard: React.FC<SelfIncomeCardProps> = ({
  income,
  currency,
  loading,
  refetch,
}) => {
  const { selfUpdateUser } = useSelfUpdateUser()
  const [formattedIncome, setFormattedIncome] = useState<UserFinancialItem[]>(
    []
  )

  const handleSave = async (record: UserFinancialItem) => {
    const value = record.value.replaceAll(/[^0-9]/g, '')
    await selfUpdateUser({
      variables: {
        inputs: {
          [record.key]: Number(value),
        },
      },
    })
    refetch()
  }

  useEffect(() => {
    if (!income) return

    setFormattedIncome([
      {
        key: 'incomePerYear',
        label: UserIncomeItemLabel.incomePerYear,
        value: formatValue(income.incomePerYear, ValueType.amount, currency),
        editing: false,
        editable: { label: false, value: true },
      },
      {
        key: 'incomeTaxRate',
        label: UserIncomeItemLabel.incomeTaxRate,
        value: formatValue(income.incomeTaxRate, ValueType.ratio, currency),
        editing: false,
        editable: { label: false, value: true },
      },
      {
        key: 'salaryChargeRate',
        label: UserIncomeItemLabel.salaryChargeRate,
        value: formatValue(income.salaryChargeRate, ValueType.ratio, currency),
        editing: false,
        editable: { label: false, value: true },
      },
      {
        key: 'incomePerMonthBeforeTaxes',
        label: UserIncomeItemLabel.incomePerMonthBeforeTaxes,
        value: formatValue(
          income.incomePerMonthBeforeTaxes,
          ValueType.amount,
          currency
        ),
        editing: false,
        editable: { label: false, value: false },
      },
      {
        key: 'netIncomePerMonth',
        label: UserIncomeItemLabel.netIncomePerMonth,
        value: formatValue(
          income.netIncomePerMonth,
          ValueType.amount,
          currency
        ),
        editing: false,
        editable: { label: false, value: false },
      },
    ])
  }, [income])

  return (
    <UserFinancialCard
      title="Income"
      extra={
        <Statistic
          value={income?.netIncomePerMonth}
          precision={0}
          groupSeparator=""
          valueStyle={{ color: '#a9d134' }}
          suffix={currency}
        />
      }
      items={formattedIncome}
      loading={loading}
      editable={{
        handleSave,
        showDivider: false,
      }}
    />
  )
}

export default SelfIncomeCard
