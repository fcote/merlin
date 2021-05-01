import { cloneDeep } from '@apollo/client/utilities'

const queryStripTypename = (input: any) => {
  const handleTypename = (obj) => {
    if (!obj) return
    if (obj instanceof Array) {
      obj.forEach(function (item) {
        handleTypename(item)
      })
    } else if (typeof obj === 'object') {
      Object.getOwnPropertyNames(obj).forEach(function (key) {
        if (['__typename'].includes(key)) delete obj[key]
        else handleTypename(obj[key])
      })
    }
  }

  const formatted = cloneDeep(input)
  handleTypename(formatted)
  return formatted
}

export { queryStripTypename }
