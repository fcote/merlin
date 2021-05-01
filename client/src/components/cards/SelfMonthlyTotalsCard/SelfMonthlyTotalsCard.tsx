import { Statistic } from 'antd'
import React, { useState, useEffect } from 'react'

import UserFinancialCard, {
  UserFinancialItem,
} from '@components/cards/UserFinancialCard/UserFinancialCard'

import { formatValue, ValueType } from '@helpers/formatValue'

import UserMonthlyExpenses, {
  UserMonthlyExpensesItemLabel,
} from '@lib/userMonthlyExpenses'

interface SelfMonthlyTotalsCardProps {
  monthlyTotals: UserMonthlyExpenses
  currency: string
  triggerRefresh?: () => void
  loading: boolean
}

const SelfMonthlyTotalsCard: React.FC<SelfMonthlyTotalsCardProps> = ({
  monthlyTotals,
  currency,
  loading,
}) => {
  const [formattedSums, setFormattedSums] = useState<UserFinancialItem[]>([])

  useEffect(() => {
    if (!monthlyTotals) return

    setFormattedSums(
      Object.entries(monthlyTotals).map(([key, value]) => {
        const label = UserMonthlyExpensesItemLabel[key]
        return {
          key,
          label,
          value: formatValue(value, ValueType.amount, currency),
        }
      })
    )
  }, [monthlyTotals])

  return (
    <UserFinancialCard
      title="Monthly totals"
      extra={
        <Statistic
          value={formattedSums?.find((s) => s.key === 'left')?.value}
          precision={0}
          groupSeparator=""
          valueStyle={{ color: '#a9d134' }}
        />
      }
      items={formattedSums}
      loading={loading}
    />
  )
}

export default SelfMonthlyTotalsCard
