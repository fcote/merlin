import { isString } from 'lodash'
import numeral from 'numeral'

const tableSorter = (
  type: 'string' | 'number',
  key: string,
  a: any,
  b: any
) => {
  const getNumberValue = (rawValue: any) => {
    return isString(rawValue)
      ? rawValue.replace('%', '').replace(' ', '')
      : rawValue
  }

  if (type === 'number') {
    return (
      numeral(getNumberValue(a[key])).value() -
      numeral(getNumberValue(b[key])).value()
    )
  }

  return a[key]?.localeCompare(b[key]) ?? 0
}
export default tableSorter
