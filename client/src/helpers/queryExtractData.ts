import { get } from 'lodash'

import { queryStripTypename } from '@helpers/queryStripTypename'

const queryExtractData = <TData>(rawData: any, namespace?: string) => {
  if (!rawData) return

  const extractedData = namespace ? get(rawData, namespace) : rawData
  const queryName = Object.keys(extractedData ?? {})
    .filter((k) => k !== '__typename')
    .shift()
  return queryStripTypename(extractedData[queryName]) as TData
}

export { queryExtractData }
