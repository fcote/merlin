import React from 'react'

import { Color } from '@style/color'

import { FinancialStatementTableItem } from '@components/cards/FinancialStatementCard/hooks/useFinancialStatementTableItems'
import FinancialPerformancePopover from '@components/popovers/FinancialPerformancePopover/FinancialPerformancePopover'

import {
  FinancialPerformance,
  FinancialPerformanceGradeBackgroundColor,
} from '@lib/financial'

import './FinancialStatementCell.style.less'

export interface FinancialRatioCellProps {
  value?: string
  performance?: FinancialPerformance
}

const FinancialRatioCell: React.FC<FinancialRatioCellProps> = ({
  value,
  performance,
}) => {
  const color =
    FinancialPerformanceGradeBackgroundColor[performance?.grade] ??
    Color.primary

  if (!performance) return <div style={{ color }}>{value}</div>

  return (
    <div style={{ color }}>
      <FinancialPerformancePopover performance={performance}>
        {value}
      </FinancialPerformancePopover>
    </div>
  )
}

interface FinancialStatementCellProps {
  value: string
  growth?: number
  performance: FinancialPerformance
  record: FinancialStatementTableItem
}

const FinancialStatementCell = ({
  record,
  value,
  growth,
  performance,
}: FinancialStatementCellProps) => {
  const numberValue = Number(value)

  if (performance && Number.isFinite(numberValue)) {
    return <FinancialRatioCell value={value} performance={performance} />
  }

  const formattedGrowth =
    value && growth ? ` (${(growth * 100).toFixed(2)}%)` : null
  const growthClassName =
    growth > 0 ? 'statement-growth-gain' : 'statement-growth-loss'
  const className = record.isMain
    ? 'important-statement-item'
    : 'non-important-statement-item'

  return (
    <div className={className}>
      <div className="statement-value">{value ?? '-'}</div>
      {formattedGrowth && (
        <div className={growthClassName}>{formattedGrowth}</div>
      )}
    </div>
  )
}

export { FinancialStatementCell, FinancialRatioCell }
