import { groupBy, sortBy, sumBy } from 'lodash'
import { useMemo } from 'react'

import { PortfolioItem } from '@pages/Portfolio/hooks/usePortfolioItems'

const usePortfolioSectorWeights = (portfolioItems: PortfolioItem[]) =>
  useMemo(() => {
    const sectorItems = groupBy(
      portfolioItems,
      (p) => p.security.company.sector
    )

    const sectorWeights = Object.entries(sectorItems).map(
      ([sector, items]) => ({
        key: sector,
        sector,
        weight: sumBy(items, (i) => i.size),
      })
    )

    return sortBy(sectorWeights, (s) => s.weight).reverse()
  }, [portfolioItems])

export { usePortfolioSectorWeights }
