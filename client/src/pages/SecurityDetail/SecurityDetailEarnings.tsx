import React, { useEffect, useState } from 'react'

import EarningsCard from '@components/cards/EarningsCalendarCard/EarningsCard'

import {
  useEarnings,
  subscribeToMoreEarnings,
} from '@hooks/api/queries/useEarnings'

import { Security } from '@lib/security'

export type SecurityDetailEarningsProps = {
  security: Security
}

const SecurityDetailEarnings: React.FC<SecurityDetailEarningsProps> = ({
  security,
}) => {
  const [subscribed, setSubscribed] = useState<boolean>(false)

  const { earnings, getEarnings, loading, subscribeToMore } = useEarnings()

  useEffect(() => {
    if (!security) return

    const variables = {
      filters: {
        ticker: security.ticker,
      },
    }

    void getEarnings({
      variables,
    })
  }, [security])

  useEffect(() => {
    if (!subscribeToMore || subscribed) return
    subscribeToMore?.(subscribeToMoreEarnings(security.ticker))
    setSubscribed(true)
  }, [earnings])

  return (
    <div className="security-detail-earnings-calendar">
      <EarningsCard earnings={earnings} loading={loading} />
    </div>
  )
}

export default SecurityDetailEarnings
