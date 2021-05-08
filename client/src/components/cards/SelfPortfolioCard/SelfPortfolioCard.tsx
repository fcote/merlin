import { groupBy, sumBy } from 'lodash'
import React, { useMemo } from 'react'

import UserSecurityCard, {
  UserAccountSecurityItem,
} from '@components/cards/UserSecurityCard/UserSecurityCard'

import UserAccountSecurity from '@lib/userAccountSecurity'

interface SelfPortfolioCardProps {
  securities: UserAccountSecurity[]
  refetch?: () => void
  loading: boolean
}

const SelfPortfolioCard: React.FC<SelfPortfolioCardProps> = ({
  securities,
  loading,
}) => {
  const portfolioItems = useMemo(() => {
    if (!securities) return

    const securityToItem = (
      security: UserAccountSecurity
    ): UserAccountSecurityItem => ({
      key: security.id.toString(),
      name: security.name.split('.').shift(),
      volume: security.volume.toString(),
      openPrice: security.openPrice.toString(),
      profit: security.profit?.toString(),
    })

    const securityGroups = groupBy(securities, (s) => s.name)

    return Object.entries(securityGroups).map(([name, groupSecurities]) => {
      const sumVolume = sumBy(groupSecurities, (s) => s.volume)
      const sumProfit = sumBy(groupSecurities, (s) => s.profit)
      return {
        key: groupSecurities.map((s) => s.id).join('-'),
        name: name.split('.').shift(),
        volume: sumVolume.toString(),
        profit: sumProfit?.toString(),
        openPrice: (
          sumBy(groupSecurities, (s) => s.openPrice * s.volume) / sumVolume
        )
          .toFixed(2)
          .toString(),
        children: groupSecurities.map(securityToItem),
      }
    })
  }, [securities])

  return (
    <UserSecurityCard
      title="Portfolio"
      items={portfolioItems}
      loading={loading}
      emptyText="No securities"
    />
  )
}

export default SelfPortfolioCard
