const getEnumKey = (obj: { [key: string]: string }, value: string) => {
  return Object.keys(obj).find((k) => obj[k] === value)
}

export default getEnumKey
