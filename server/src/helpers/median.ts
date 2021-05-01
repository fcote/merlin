import { sortBy } from 'lodash'

const median = (array: number[]) => {
  array = sortBy(array)
  if (array.length % 2 === 0) {
    return (array[array.length / 2] + array[array.length / 2 - 1]) / 2
  } else {
    return array[(array.length - 1) / 2]
  }
}

export { median }
