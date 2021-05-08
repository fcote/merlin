import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'
import { Input, Spin, AutoComplete } from 'antd'
import { debounce, isEmpty } from 'lodash'
import React, { useMemo, useState } from 'react'

import { useSecuritySearch } from '@hooks/api/queries/useSecuritySearch'

export type TickerAutocompleteProps = {
  value?: string
  onChange?: (ticker: string) => void
}

const TickerAutocomplete: React.FC<TickerAutocompleteProps> = ({
  value: providedValue,
  onChange,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>()

  const { securitySearch, securitySearchResults, loading } = useSecuritySearch()

  const handleSearch = async (ticker: string) => {
    if (isEmpty(ticker)) {
      return
    }

    await securitySearch({
      variables: { ticker: ticker.toUpperCase() },
    })
  }

  const handleSelect = (ticker: string) => {
    setSelectedTicker(ticker)
    onChange?.(ticker)
  }

  const searchItems = useMemo(() => {
    if (!securitySearchResults?.length) return []

    return securitySearchResults.map((r) => ({
      value: r.ticker,
      label: `${r.ticker} (${r.name})`,
    }))
  }, [securitySearchResults])

  const value = useMemo(() => {
    return providedValue || selectedTicker
  }, [providedValue, selectedTicker])

  return (
    <AutoComplete
      options={searchItems}
      onSearch={debounce(handleSearch, 300)}
      onChange={handleSelect}
      value={value}
      style={{ width: '100%' }}
    >
      <Input
        size="large"
        placeholder="Search ticker"
        prefix={<SearchOutlined />}
        suffix={loading && <Spin indicator={<LoadingOutlined />} />}
      />
    </AutoComplete>
  )
}

export default TickerAutocomplete
