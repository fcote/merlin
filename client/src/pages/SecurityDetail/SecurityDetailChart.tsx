import React, { useEffect } from 'react'

import { SecurityChart } from '@components/charts/SecurityChart/SecurityChart'

import { useHistoricalPrices } from '@hooks/api/queries/useHistoricalPrices'

import { Security } from '@lib/security'

export type SecurityDetailChartProps = {
  security: Security
}

const SecurityDetailChart: React.FC<SecurityDetailChartProps> = ({
  security,
}) => {
  const { getHistoricalPrices, historicalPrices, loading } =
    useHistoricalPrices()
  useEffect(() => {
    if (!security) return

    const variables = {
      filters: {
        ticker: security.ticker,
      },
    }

    void getHistoricalPrices({
      variables,
    })
  }, [security])

  return (
    <div className="security-detail-chart">
      <SecurityChart loading={loading} prices={historicalPrices} />
    </div>
  )
}

export default SecurityDetailChart
