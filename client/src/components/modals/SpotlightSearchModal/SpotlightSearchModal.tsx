import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { Input, Modal, Table, Spin, InputRef } from 'antd'
import { TableRowSelection } from 'antd/es/table/interface'
import { ColumnType } from 'antd/lib/table'
import { debounce, isEmpty } from 'lodash'
import React, {useState, useRef, ChangeEvent, useMemo, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

import { useSecuritySearch } from '@hooks/api/queries/useSecuritySearch'
import useKeyEventListener from '@hooks/useKeyEventListener'

import { SecurityType } from '@lib/security'

import './SpotlightSearchModal.style.less'

interface SpotlightSearchProps {
  openKey: string
  closeKey: string
}

const SpotlightSearchModal = ({ openKey, closeKey }: SpotlightSearchProps) => {
  const { securitySearch, securitySearchResults, loading } = useSecuritySearch()

  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState<number>(null)
  const searchInput = useRef<InputRef>()
  const navigate = useNavigate()

  const searchItems = useMemo(() => {
    if (!securitySearchResults?.length) return []

    return securitySearchResults.map((r, i) => ({
      key: i,
      name: `${r.ticker} (${SecurityType[r.securityType]})`,
      company: r.name,
    }))
  }, [securitySearchResults])

  useEffect(() => {
    if (!searchInput.current || !isSearchVisible) return
    setTimeout(() => searchInput.current.focus(), 100)
  }, [isSearchVisible])

  const handleOpen = (_: KeyboardEvent) => {
    if (isSearchVisible) return
    setIsSearchVisible(true)
  }
  const handleClose = (_?: KeyboardEvent) => {
    if (!isSearchVisible) return
    setIsSearchVisible(false)
  }
  const handleSelectRowDown = (_: KeyboardEvent) => {
    if (!isSearchVisible) return
    const lastElement = searchItems.length - 1
    let row =
      selectedRow >= lastElement
        ? lastElement
        : selectedRow != null
        ? selectedRow + 1
        : 0
    setSelectedRow(row)
  }
  const handleSelectRowUp = (_: KeyboardEvent) => {
    if (!isSearchVisible) return
    setSelectedRow(selectedRow > 0 ? selectedRow - 1 : null)
  }
  const handleValidate = (_: KeyboardEvent) => {
    if (!isSearchVisible) return

    const element = securitySearchResults[selectedRow]

    handleClose()

    navigate(`/security/${element.ticker}/statement/Y`)
  }

  const onSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isEmpty(event.target.value)) {
      return
    }

    await securitySearch({
      variables: { ticker: event.target.value.toUpperCase() },
    })
  }

  useKeyEventListener('keyup', openKey, handleOpen)
  useKeyEventListener('keyup', closeKey, handleClose)
  useKeyEventListener('keydown', 'ArrowDown', handleSelectRowDown)
  useKeyEventListener('keydown', 'ArrowUp', handleSelectRowUp)
  useKeyEventListener('keydown', 'Enter', handleValidate)

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys: [selectedRow],
    hideSelectAll: true,
    type: undefined,
    renderCell: () => '', // Hide checkbox
  }

  const columns: ColumnType<any>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      width: 150,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      align: 'right',
    },
  ]

  return (
    <Modal
      className="spotlight-search"
      open={isSearchVisible}
      closable={false}
      footer={null}
      width={600}
    >
      <Input
        ref={searchInput}
        size="large"
        style={{ width: '100%' }}
        prefix={<SearchOutlined />}
        placeholder="Search ticker"
        onChange={debounce(onSearch, 200)}
        suffix={loading && <Spin indicator={<LoadingOutlined />} />}
        bordered={false}
      />
      <Table
        style={{ display: searchItems.length ? 'block' : 'none' }}
        showHeader={false}
        pagination={false}
        rowSelection={{ ...rowSelection }}
        columns={columns}
        dataSource={searchItems}
      />
    </Modal>
  )
}

export default SpotlightSearchModal
