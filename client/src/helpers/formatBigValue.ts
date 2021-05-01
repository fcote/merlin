import { range } from 'lodash'
import numeral from 'numeral'

import {
  FinancialUnitType,
  valueForFinancialUnit,
  FinancialUnit,
} from '@lib/financialItem'

export const formatBigValue = (
  value: number,
  unitType: FinancialUnitType,
  unit: FinancialUnit
) => {
  if (!value) return null

  const getFormat = (decimalPlaces: number) => {
    const decimals = range(decimalPlaces)
      .map((_) => '0')
      .join('')
    return `0.${decimals}a`
  }

  const maxFormatSize = 6
  let decimalPlaces = 2
  const numberToFormat = value * valueForFinancialUnit(unit)

  let formatted = numeral(numberToFormat).format(getFormat(decimalPlaces))
  while (formatted.length > maxFormatSize) {
    decimalPlaces -= 1
    formatted = numeral(numberToFormat).format(getFormat(decimalPlaces))
  }
  return formatted
}
