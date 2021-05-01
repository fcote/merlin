import { chunk } from 'lodash'
import { transaction, Model } from 'objection'
import pmap from 'p-map'

import { searchLink, quoteLink, companyOverviewLink } from '@links/links'
import {
  SecurityListResult,
  SecurityQuoteResult,
  SecurityCompanyOverviewResult,
} from '@links/types'
import { logger } from '@logger'
import { Financial } from '@models/financial'
import { FinancialItemType } from '@models/financialItem'
import { Sector } from '@models/sector'
import { FinancialPeriodFields } from '@resolvers/financial/financial.inputs'
import { FinancialService } from '@services/financial'
import { SecurityService } from '@services/security'
import { ServiceMethod } from '@services/service'

class JobFullSyncMethod extends ServiceMethod {
  private totalNumberOfSecurities: number
  private totalNumberOfSectors: number

  run = async () => {
    // Sync securities
    const securityList = (await searchLink.list()).filter(
      (s) => !s.ticker.includes('.')
    )
    const securityGroups = chunk(securityList, 100)
    this.totalNumberOfSecurities = securityList.length
    await pmap(
      securityGroups,
      async (securityGroup: SecurityListResult[], groupIndex) => {
        const tickers = securityGroup.map((s) => s.ticker)
        const quotes = await quoteLink.batchQuotes(tickers)
        const companyOverviews = await companyOverviewLink.batchCompanyOverview(
          tickers
        )

        await pmap(
          securityGroup,
          async (security, index) => {
            return this.processSecurity(
              security,
              quotes,
              companyOverviews,
              groupIndex * 100 + index + 1
            )
          },
          { concurrency: 5 }
        )
      },
      { concurrency: 1 }
    )

    // Sync sectors financials
    const sectors = await Sector.query()
    const periods = await Financial.query()
      .distinct('financials.year', 'financials.period')
      .joinRelated('financialItem')
      .whereNull('financials.sectorId')
      .where('financialItem.type', FinancialItemType.ratio)
    this.totalNumberOfSectors = sectors.length
    await pmap(
      sectors,
      async (sector, index) => {
        await this.processSector(sector, periods, index + 1)
      },
      { concurrency: 1 }
    )
  }

  private processSecurity = async (
    security: SecurityListResult,
    quotes: SecurityQuoteResult[],
    companyOverviews: SecurityCompanyOverviewResult[],
    index: number
  ) => {
    const progress = `${index}/${this.totalNumberOfSecurities}`
    const ticker = security.ticker
    const quote = quotes.find((q) => q.symbol === ticker)
    const companyOverview = companyOverviews.find((o) => o.symbol === ticker)

    if (!quote || !companyOverview) {
      logger.info('security > syncAll > missing quote or company overview', {
        ticker,
        quote,
        companyOverview,
      })
      return
    }

    try {
      await transaction(Model.knex(), async (trx) => {
        await new SecurityService({ trx }).sync({
          ticker,
          quote,
          companyOverview,
        })
      })
      logger.info('security > syncAll > successfully synced security', {
        ticker,
        progress,
      })
    } catch (err) {
      logger.error('security > syncAll > failed to sync security', {
        err,
        ticker,
        progress,
      })
    }
  }

  private processSector = async (
    { name }: Sector,
    periods: FinancialPeriodFields[],
    index: number
  ) => {
    const progress = `${index}/${this.totalNumberOfSectors}`
    try {
      await transaction(Model.knex(), async (trx) => {
        await new FinancialService({ trx }).syncSector({ name, periods })
      })
      logger.info('security > syncAll > successfully synced sector', {
        name,
        progress,
      })
    } catch (err) {
      logger.error('security > syncAll > failed to sync sector', {
        err,
        name,
        progress,
      })
    }
  }
}

export { JobFullSyncMethod }
