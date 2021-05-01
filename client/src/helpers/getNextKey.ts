import { max } from 'lodash'

const getNextKey = (list: { key: string }[]) => {
  return (max(list.map((t) => Number(t.key))) + 1).toString() ?? '1'
}

export { getNextKey }
