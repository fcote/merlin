import { useState, useEffect } from 'react'

import { EditableRecord } from '@components/tables/EditableTable/EditableTable'

import { formatBigValue } from '@helpers/formatBigValue'
import successNotification from '@helpers/successNotification'

import useSecurityGetOrSync from '@hooks/api/mutations/useSecurityGetOrSync'
import {
  FollowedSecurityLinkInputs,
  useSelfFollowedSecurityLink,
} from '@hooks/api/mutations/useSelfFollowedSecurityLink'
import {
  FollowedSecurityUnlinkInputs,
  useSelfFollowedSecurityUnlink,
} from '@hooks/api/mutations/useSelfFollowedSecurityUnlink'

import { FinancialUnitType, FinancialUnit } from '@lib/financialItem'
import FollowedSecurityGroup from '@lib/followedSecurityGroup'
import { SuccessMessage } from '@lib/messages'
import { Security } from '@lib/security'

export type WatchlistTableItem = EditableRecord & {
  key: string
  ticker: string
  industry?: string
  marketCapitalization?: string
  price?: number
  changePercent?: number
  extendedHoursPrice?: number
  extendedHoursChangePercent?: number
  high52Week?: number
  low52Week?: number
  security?: Security
  securitySync?: {
    loading: boolean
    progress: number
  }
}

const addItemKey = 'temp-item'

const useWatchlistTableItems = (
  watchlist: FollowedSecurityGroup,
  searchText: string,
  triggerRefresh: () => void
) => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistTableItem[]>([])
  const [currentSyncWatchlistItem, setCurrentSyncWatchlistItem] =
    useState<string>()

  const { selfFollowedSecurityUnlink } = useSelfFollowedSecurityUnlink()
  const { selfFollowedSecurityLink } = useSelfFollowedSecurityLink()
  const { getOrSyncSecurity, securityLoading, securitySyncProgress } =
    useSecurityGetOrSync()

  const formatWatchlistItem = (security: Security): WatchlistTableItem => ({
    key: security.id.toString(),
    ticker: security.ticker,
    industry: security.company?.industry,
    price: security.currentPrice,
    changePercent: security.dayChangePercent,
    extendedHoursPrice: security.extendedHoursPrice,
    extendedHoursChangePercent: security.extendedHoursChangePercent,
    marketCapitalization: formatBigValue(
      security.marketCapitalization,
      FinancialUnitType.currency,
      FinancialUnit.millions
    ),
    high52Week: security.high52Week,
    low52Week: security.low52Week,
    editable: { name: false },
    editing: false,
    security,
  })

  const handleAdd = () => {
    if (currentSyncWatchlistItem) return

    const newData: WatchlistTableItem = {
      key: addItemKey,
      ticker: '',
      editing: true,
      editable: { ticker: true },
    }
    setCurrentSyncWatchlistItem(newData.key)
    setWatchlistItems([newData, ...watchlistItems])
  }

  const handleSave = async (record: WatchlistTableItem) => {
    const security = await getOrSyncSecurity(record.ticker)
    if (!security) return
    const inputs: FollowedSecurityLinkInputs = {
      securityId: security.id,
      followedSecurityGroupId: watchlist.id,
    }
    await selfFollowedSecurityLink({
      variables: { inputs },
    })
    successNotification(SuccessMessage.securitySync, record.ticker)
    const index = watchlistItems.findIndex((t) => t.key === record.key)
    if (index >= 0) {
      watchlistItems[index] = formatWatchlistItem(security)
    } else {
      watchlistItems.push(formatWatchlistItem(security))
    }
    setWatchlistItems([...watchlistItems])
    setCurrentSyncWatchlistItem(null)
    triggerRefresh()
  }

  const handleRemove = async (record: WatchlistTableItem) => {
    const inputs: FollowedSecurityUnlinkInputs = {
      followedSecurityGroupId: watchlist.id,
      securityId: record.security.id,
    }
    await selfFollowedSecurityUnlink({
      variables: { inputs },
    })
    setWatchlistItems([...watchlistItems.filter((s) => s.key !== record.key)])
    successNotification(SuccessMessage.deleteFollowedSecurity, record.ticker)
  }

  // Security sync watcher
  useEffect(() => {
    setWatchlistItems(
      watchlistItems.map((item) => {
        if (item.key !== currentSyncWatchlistItem) return item

        return {
          ...item,
          securitySync: {
            loading: securityLoading,
            progress: securitySyncProgress,
          },
        }
      })
    )
  }, [currentSyncWatchlistItem, securitySyncProgress, securityLoading])

  // Watchlist modified watcher
  useEffect(() => {
    if (!watchlist.followedSecurities?.nodes) return

    const newWatchlistItems = watchlist.followedSecurities.nodes
      .filter((s) =>
        s.security.ticker.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((f) => formatWatchlistItem(f.security))
    const tempItems = watchlistItems.filter((i) => i.key === addItemKey)
    setWatchlistItems([...tempItems, ...newWatchlistItems])
  }, [watchlist, searchText])

  return {
    watchlistItems,
    handleAdd,
    handleSave,
    handleRemove,
  }
}

export default useWatchlistTableItems
