import { Forex } from '@lib/forex'

const getExchangeRate = (
  fromCurrency: string,
  userCurrency: string,
  forex: Forex[]
) => {
  const foundForex = forex?.find(
    (f) => f.fromCurrency === fromCurrency && f.toCurrency === userCurrency
  )
  return foundForex?.exchangeRate ?? 1
}

export { getExchangeRate }
