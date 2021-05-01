import { APILink, EarningLink } from '@links'
import { SecurityEarningResult } from '@links/types'
import { yahooFinanceEarnings } from '@links/yahooFinance/link.yahooFinance.earnings'

class YahooFinanceLink extends APILink implements EarningLink {
  constructor() {
    super({
      endpoint: 'https://finance.yahoo.com',
      base: '',
    })
  }

  earnings = async (ticker: string): Promise<SecurityEarningResult[]> => {
    return yahooFinanceEarnings.bind(this, ticker)()
  }
}

const yahooFinance = new YahooFinanceLink()

export { YahooFinanceLink, yahooFinance }
