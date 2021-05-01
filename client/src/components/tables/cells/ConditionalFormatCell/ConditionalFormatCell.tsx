import { get } from 'lodash'
import React from 'react'

const ConditionalFormatCell = (
  key: string,
  record: any,
  type?: 'currency' | 'percentage'
) => {
  let rawValue = get(record, key) as number
  if (!rawValue) return <div />
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return <div />
  const className = value >= 0 ? 'security-value-gain' : 'security-value-loss'
  const suffix = type === 'percentage' ? ' %' : type === 'currency' ? ' €' : ''
  const formattedValue = `${value.toFixed(2)}${suffix}`
  return <div className={className}>{formattedValue}</div>
}

export default ConditionalFormatCell
