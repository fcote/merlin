class ForexCurrencyPair {
  fromCurrency: string

  toCurrency: string
}

class ForexFilters {
  currencyPairs: ForexCurrencyPair[]
}

export { ForexFilters, ForexCurrencyPair }
