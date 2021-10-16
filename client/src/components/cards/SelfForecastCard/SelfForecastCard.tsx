import React, { useState, useEffect } from 'react'

import UserFinancialCard, {
  UserFinancialItem,
} from '@components/cards/UserFinancialCard/UserFinancialCard'
import UserTransactionTableModal from '@components/modals/UserTransactionTableModal/UserTransactionTableModal'

import { dayjs } from '@helpers/dayjs'
import { formatValue, ValueType } from '@helpers/formatValue'

import { UserMonthlyForecast } from '@lib/userMonthlyForecast'
import UserTransaction from '@lib/userTransaction'

interface SelfForecastCardProps {
  monthlyForecast: UserMonthlyForecast
  punctualTransactions: UserTransaction[]
  currency: string
  loading: boolean
  refetch?: () => void
}

const SelfForecastCard: React.FC<SelfForecastCardProps> = ({
  monthlyForecast,
  punctualTransactions,
  currency,
  loading,
  refetch,
}) => {
  const [isForecastModalVisible, setIsForecastModalVisible] =
    useState<boolean>(false)
  const [forecastModalDate, setForecastModalDate] = useState<string>(null)
  const [formattedMonthlyForecast, setFormattedMonthlyForecast] = useState<
    UserFinancialItem[]
  >([])

  useEffect(() => {
    if (!monthlyForecast) return

    setFormattedMonthlyForecast(
      Object.entries(monthlyForecast).map(([key, forecast]) => {
        const label = dayjs(key).format('MMMM YY')
        const value = formatValue(forecast.balance, ValueType.amount, currency)
        const extras = Math.round(forecast.extras)
        return {
          key,
          label,
          value: `${value} (${extras})`,
          date: key,
        }
      })
    )
  }, [monthlyForecast])

  const onMonthlyForecastClick = (r: UserFinancialItem) => () => {
    setForecastModalDate(r.date)
    setIsForecastModalVisible(true)
  }

  const TransactionModal = () => (
    <UserTransactionTableModal
      date={forecastModalDate}
      transactions={punctualTransactions}
      isVisible={isForecastModalVisible}
      setIsVisible={setIsForecastModalVisible}
      triggerRefresh={refetch}
    />
  )

  return (
    <div className="self-monthly-forecast-section">
      {!loading && TransactionModal()}
      <UserFinancialCard
        title="Forecast"
        items={formattedMonthlyForecast}
        onRowClick={onMonthlyForecastClick}
        loading={loading}
      />
    </div>
  )
}

export default SelfForecastCard
