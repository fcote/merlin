import { Tooltip } from 'antd'
import { ColumnType } from 'antd/es/table'
import katex from 'katex'
import { uniqBy } from 'lodash'
import React, { useMemo } from 'react'

import {
  FinancialStatementTableItem,
  FinancialStatementTableItemValue,
} from '@components/cards/FinancialStatementCard/hooks/useFinancialStatementTableItems'
import { FinancialStatementCell } from '@components/tables/cells/FinancialStatementCell/FinancialStatementCell'

import { Financial, FinancialFreq } from '@lib/financial'
import { FinancialItem } from '@lib/financialItem'

const useFinancialStatementTableColumns = (financialItems: FinancialItem[]) => {
  const renderValue = (
    value: FinancialStatementTableItemValue,
    record: FinancialStatementTableItem
  ) => (
    <FinancialStatementCell
      record={record}
      value={value?.value}
      growth={value?.growth}
      performance={value?.performance}
    />
  )

  const renderFinancialItemLabel = (
    value: string,
    record: FinancialStatementTableItem
  ) => {
    if (record.latexDescription) {
      return (
        <Tooltip
          placement="right"
          title={
            <div
              style={{ padding: 10 }}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(record.latexDescription),
              }}
            />
          }
        >
          <div style={{ display: 'inline-block' }}>{value}</div>
        </Tooltip>
      )
    }

    const className = record.isMain
      ? 'important-statement-item'
      : 'non-important-statement-item'
    return <div className={className}>{value}</div>
  }

  const getColumnTitle = (f: Financial) => {
    if (f.period.includes(FinancialFreq.Q)) return `${f.year} (${f.period})`
    return f.year.toString()
  }

  return useMemo(() => {
    const financials = financialItems.flatMap((fi) => fi.financials)

    const statementColumns: ColumnType<FinancialStatementTableItem>[] = uniqBy(
      financials,
      (f) => `${f.year}-${f.period}`
    )
      .slice(0, 20)
      .map((f) => ({
        title: getColumnTitle(f),
        dataIndex: `${f.year}-${f.period}`,
        width: 65,
        render: renderValue,
      }))

    return [
      {
        title: '',
        dataIndex: 'itemName',
        width: 200,
        render: renderFinancialItemLabel,
      },
      ...statementColumns,
    ] as ColumnType<FinancialStatementTableItem>[]
  }, [financialItems])
}

export default useFinancialStatementTableColumns
