import { APILink, FinancialLink } from '@links/index'
import { macrotrendsFinancials } from '@links/macrotrends/link.macrotrends.financial'
import { SecurityFinancialResult } from '@links/types'
import { FinancialFreq } from '@models/financial'

class MacroTrendsLink extends APILink implements FinancialLink {
  constructor() {
    super({
      endpoint: 'https://www.macrotrends.net/',
      base: '',
    })
  }

  financials = async (
    ticker: string,
    freq: FinancialFreq
  ): Promise<SecurityFinancialResult[]> => {
    return macrotrendsFinancials.bind(this, ticker, freq)()
  }
}

export { MacroTrendsLink }
