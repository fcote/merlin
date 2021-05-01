import { Transaction } from 'objection'

import { quoteLink, companyOverviewLink } from '@links/links'
import {
  SecurityCompanyOverviewResult,
  SecurityQuoteResult,
} from '@links/types'
import { Security, SecurityType } from '@models/security'
import { pubSub, SubscriptionChannel } from '@pubSub'
import { SecurityFields } from '@resolvers/security/security.inputs'
import { CompanyService } from '@services/company'
import { EarningService } from '@services/earning'
import { FinancialService } from '@services/financial'
import { HistoricalPriceService } from '@services/historicalPrice'
import { SecurityService } from '@services/security/index'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'
import {
  KnexEventObject,
  KnexEventBuilderObject,
  eventMethods,
} from '@typings/extensions/knex'

class SecuritySyncEmitter {
  private readonly ticker: string
  private readonly trx: Transaction
  private watchers: ((
    obj: KnexEventObject,
    builder: KnexEventBuilderObject
  ) => void)[] = []
  public currentProgress: number = 0

  constructor(ticker: string, trx: Transaction) {
    this.ticker = ticker
    this.trx = trx

    this.trx.on(
      'query-response',
      (_, obj: KnexEventObject, builder: KnexEventBuilderObject) => {
        this.watchers.forEach((s) => s(obj, builder))
      }
    )
  }

  public sendProgress = (progress: number) => {
    this.currentProgress = progress

    void pubSub.publish(SubscriptionChannel.securitySyncProgressChanges, {
      ticker: this.ticker,
      progress: this.currentProgress,
    })
  }

  public watchTransactionProgress = (
    sizeToProcess: number,
    table: string,
    targetProgress: number = 1
  ) => {
    const progressLeft = targetProgress - this.currentProgress

    this.watchers.push(
      (obj: KnexEventObject, builder: KnexEventBuilderObject) => {
        if (
          !eventMethods.includes(obj.method) ||
          builder._single?.table !== table
        )
          return

        const modifiedCount = obj.response.rowCount
        if (!modifiedCount) return
        const progress =
          this.currentProgress + (modifiedCount / sizeToProcess) * progressLeft
        this.sendProgress(progress)
      }
    )
  }

  public clearWatchers = () => (this.watchers = [])
}

class SecuritySyncMethod extends ServiceMethod {
  protected service: SecurityService

  private ticker: string
  private companyService: CompanyService
  private financialService: FinancialService
  private historicalPriceService: HistoricalPriceService
  private earningService: EarningService
  private syncEmitter: SecuritySyncEmitter

  constructor(service: SecurityService) {
    super(service)
    this.companyService = new CompanyService(this.ctx)
    this.financialService = new FinancialService(this.ctx)
    this.historicalPriceService = new HistoricalPriceService(this.ctx)
    this.earningService = new EarningService(this.ctx)
  }

  run = async (inputs: SecurityFields): Promise<Security> => {
    this.syncEmitter = new SecuritySyncEmitter(inputs.ticker, this.trx)
    this.ticker = inputs.ticker

    const overview =
      inputs.companyOverview ??
      (await companyOverviewLink.companyOverview(this.ticker))
    const quote = inputs.quote ?? (await quoteLink.quote(this.ticker))
    this.syncEmitter.sendProgress(0.05)

    if (!quote) {
      throw new ApolloResourceNotFound('COULD_NOT_FETCH_SECURITY')
    }

    let security = await Security.query(this.trx).findOne('ticker', this.ticker)

    // Security type
    const securityType = this.getSecurityType(overview, quote)

    // Sync parent data
    const company = overview && (await this.companyService.sync({ overview }))
    this.syncEmitter.sendProgress(0.1)

    security = await Security.query(this.trx).upsertGraphAndFetch({
      ...(security && { id: security.id }),
      ...(company && { companyId: company.id }),
      ticker: this.ticker,
      currency: overview?.currency,
      type: securityType,
      ...Security.getPriceUpdateFromQuote(quote),
    })
    this.syncEmitter.sendProgress(0.15)

    // Sync historical prices
    await this.historicalPriceService.sync(this.ticker, this.syncEmitter, 0.5)

    if (security.type === SecurityType.commonStock) {
      // Sync financials
      await this.financialService.syncSecurity(
        {
          ticker: this.ticker,
        },
        this.syncEmitter,
        0.9
      )
      // Sync earning dates
      await this.earningService.sync(this.ticker, this.syncEmitter, 1)
    } else {
      this.syncEmitter.sendProgress(1)
    }

    return security
  }

  private getSecurityType = (
    overview: SecurityCompanyOverviewResult,
    quote: SecurityQuoteResult
  ) => {
    if (quote.securityType === SecurityType.commonStock)
      return overview.securityType
    return quote.securityType
  }
}

export { SecuritySyncMethod, SecuritySyncEmitter }
