export enum ValueType {
  amount = 'amount',
  ratio = 'ratio',
}

export const formatValue = (
  value: number,
  type: ValueType,
  currency: string
) => {
  return type === ValueType.ratio
    ? `${value ?? 0} %`
    : `${Math.round(value)} ${currency}`
}
