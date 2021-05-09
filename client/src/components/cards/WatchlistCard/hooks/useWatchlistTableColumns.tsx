import { DeleteOutlined } from '@ant-design/icons'
import { Progress, Tag, Button } from 'antd'
import { RenderedCell } from 'rc-table/lib/interface'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { WatchlistTableItem } from '@components/cards/WatchlistCard/hooks/useWatchlistTableItems'
import { EditableColumn } from '@components/tables/EditableTable/EditableTable'
import ConditionalFormatCell from '@components/tables/cells/ConditionalFormatCell/ConditionalFormatCell'

import { progressBarStrokeColor } from '@helpers/progressBarStrokeColor'
import tableSorter from '@helpers/tableSorter'

import { FinancialItemType } from '@lib/financialItem'
import { SecurityMarketStatus, SecurityMarketStatusLabel } from '@lib/security'

const useWatchlistTableColumns = (
  watchlistItems: WatchlistTableItem[],
  handleRemove: (record: WatchlistTableItem) => void
) => {
  const [columns, setColumns] = useState<EditableColumn[]>([])

  const renderDefault = (
    value: any,
    record: WatchlistTableItem
  ): RenderedCell<WatchlistTableItem> => {
    return {
      children: value,
      props: {
        colSpan: record.securitySync?.loading ? 0 : 1,
      },
    }
  }

  const renderName = (
    _: any,
    record: WatchlistTableItem
  ): RenderedCell<WatchlistTableItem> => {
    const progress = (
      <Progress
        strokeColor={progressBarStrokeColor}
        percent={record.securitySync?.progress ?? 0}
      />
    )
    const link = (
      <Link
        to={`/security/${record.ticker}/${FinancialItemType.statement}/Y`}
        className="ant-btn ant-btn-sm"
      >
        {record.ticker}
      </Link>
    )
    const isLoading = record.securitySync?.loading
    const isEditable = !isLoading && !record.security?.id
    const children = isLoading ? progress : isEditable ? record.ticker : link

    record.editable.ticker = isEditable
    return {
      children,
      props: {
        colSpan: isLoading ? columns.length : 1,
      },
    }
  }

  const defaultColumns: EditableColumn[] = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      align: 'left',
      sorter: (a, b) => tableSorter('string', 'ticker', a, b),
      editable: true,
      required: true,
      render: renderName,
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      align: 'left',
      sorter: (a, b) => tableSorter('string', 'industry', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: 'M Cap.',
      dataIndex: 'marketCapitalization',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'marketCapitalization', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'price', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: '%C',
      dataIndex: 'changePercent',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'changePercent', a, b),
      editable: false,
      required: false,
      render: (_, record) =>
        renderDefault(
          ConditionalFormatCell('changePercent', record, 'percentage'),
          record
        ),
    },
    {
      title: '52W H',
      dataIndex: 'high52Week',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'high52Week', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: '52W L',
      dataIndex: 'low52Week',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'low52Week', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: '',
      dataIndex: 'operation',
      editable: false,
      required: false,
      align: 'right',
      render: (_, record: WatchlistTableItem) => {
        if (!record.security) return renderDefault(null, record)
        return renderDefault(
          <Button
            key="remove-followed-security-button"
            onClick={() => handleRemove(record)}
            icon={<DeleteOutlined />}
          />,
          record
        )
      },
    },
  ]

  const extendedHoursColumns = (
    marketStatus: SecurityMarketStatus
  ): EditableColumn[] => [
    {
      title: `${SecurityMarketStatusLabel[marketStatus]} price`,
      dataIndex: 'extendedHoursPrice',
      align: 'left',
      sorter: (a, b) => tableSorter('number', 'extendedHoursPrice', a, b),
      editable: false,
      required: false,
      render: renderDefault,
    },
    {
      title: `${SecurityMarketStatusLabel[marketStatus]} %C`,
      dataIndex: 'extendedHoursChangePercent',
      align: 'left',
      sorter: (a, b) =>
        tableSorter('number', 'extendedHoursChangePercent', a, b),
      editable: false,
      required: false,
      render: (_, record) =>
        renderDefault(
          ConditionalFormatCell(
            'extendedHoursChangePercent',
            record,
            'percentage'
          ),
          record
        ),
    },
  ]

  useEffect(() => {
    const extendedHoursStatuses = [
      SecurityMarketStatus.preMarket,
      SecurityMarketStatus.afterHours,
    ]
    const marketStatus = watchlistItems?.find((fs) =>
      extendedHoursStatuses.includes(fs.security?.marketStatus)
    )?.security?.marketStatus
    const newColumns = [...defaultColumns]
    if (marketStatus) {
      newColumns.splice(3, 0, ...extendedHoursColumns(marketStatus))
    }
    setColumns(newColumns)
  }, [watchlistItems])

  return columns
}

export default useWatchlistTableColumns
