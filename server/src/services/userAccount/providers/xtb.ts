import { uniq } from 'lodash'
import pmap from 'p-map'

import { WebsocketClient } from '@drivers/websocketClient'
import { dayjs } from '@helpers/dayjs'
import { UserAccountSecurity } from '@models/userAccountSecurity'
import { SecurityProvider } from '@services/userAccount/providers/index'
import { RequestContext } from '@typings/context'

interface XTBResponse<T> {
  status: boolean
  customTag: string
  returnData: T
}

interface XTBMarginLevel {
  balance: number
  equityFX: number
  equity: number
  cashStockValue: number
  margin_free: number
}

interface XTBSymbol {
  symbol: string
  currency: string
}

interface XTBTrade {
  close_price: number
  close_time: number
  close_timeString: string
  closed: boolean
  cmd: number
  comment: string
  commission: number
  customComment: string
  digits: number
  expiration: number
  expirationString: string
  margin_rate: number
  offset: number
  open_price: number
  open_time: number
  open_timeString: string
  order: number
  order2: number
  position: number
  profit: number
  sl: number
  storage: number
  symbol: string
  timestamp: number
  tp: number
  volume: number
}

class XTBProvider extends SecurityProvider {
  public static endpoint: string = 'wss://ws.xtb.com/real'

  private client: WebsocketClient
  private loginCommand: any = {
    command: 'login',
    arguments: {
      userId: this.userId,
      password: this.password,
    },
  }

  constructor(
    protected userAccountId: string | number,
    protected userId: string,
    protected password: string,
    protected ctx: Partial<RequestContext>
  ) {
    super(userAccountId, userId, password, ctx)
    this.client = new WebsocketClient(XTBProvider.endpoint, this.loginCommand)
  }

  getBalance = async (): Promise<number> => {
    const response = await this.sendGetBalanceCommand()
    return response?.returnData?.equity
  }

  getAccountSecurities = async (): Promise<Partial<UserAccountSecurity>[]> => {
    const tradesResponse = await this.sendGetTradesCommand()
    const tradesData = tradesResponse?.returnData || []
    const symbols = uniq(tradesData.map((t) => t.symbol))
    const symbolsResponse = await pmap(symbols, this.sendGetSymbolCommand, {
      concurrency: 1,
    })
    const symbolsData: XTBSymbol[] =
      symbolsResponse?.flatMap((r) => r.returnData || []) || []

    const tradeToAccountSecurity = (
      trade: XTBTrade
    ): Partial<UserAccountSecurity> => ({
      name: trade.symbol,
      profit: trade.profit,
      volume: trade.volume,
      openPrice: trade.open_price,
      currency: symbolsData?.find((s) => s.symbol === trade.symbol)?.currency,
      openedAt: dayjs(trade.open_time).toDate(),
      externalId: trade.order.toString(),
      userAccountId: this.userAccountId,
      ...(trade.closed && { deletedAt: new Date() }),
    })
    return tradesData.map(tradeToAccountSecurity)
  }

  private sendGetBalanceCommand = () => {
    const marginLevelCommand = {
      command: 'getMarginLevel',
    }
    return this.client.sendCommand<XTBResponse<XTBMarginLevel>>({
      message: marginLevelCommand,
      idField: 'customTag',
    })
  }

  private sendGetTradesCommand = () => {
    const tradesCommand = {
      command: 'getTrades',
      arguments: {
        openedOnly: true,
      },
    }
    return this.client.sendCommand<XTBResponse<XTBTrade[]>>({
      message: tradesCommand,
      idField: 'customTag',
    })
  }

  private sendGetSymbolCommand = (symbol: string) => {
    const symbolCommand = {
      command: 'getSymbol',
      arguments: {
        symbol,
      },
    }
    return this.client.sendCommand<XTBResponse<XTBSymbol>>({
      message: symbolCommand,
      wait: 200,
      idField: 'customTag',
    })
  }
}

export { XTBProvider }
