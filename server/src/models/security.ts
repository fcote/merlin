import { isUndefined } from 'lodash'
import { JSONSchema, QueryContext, Model, PartialModelObject } from 'objection'

import { SecurityQuoteResult } from '@links/types'
import { BaseModel } from '@models/base'
import { unique } from '@models/base/validationMethods'
import { Company } from '@models/company'
import { Financial } from '@models/financial'
import { FollowedSecurity } from '@models/followedSecurity'
import { HistoricalPrice } from '@models/historicalPrice'
import { UserAccountSecurity } from '@models/userAccountSecurity'
import { PaginatedClass } from '@resolvers/paginated'

enum SecurityType {
  commonStock = 'Common Stock',
  commodity = 'Commodity',
  etf = 'ETF',
  index = 'Index',
  mutualFund = 'Mutual Fund',
}

enum SecurityMarketStatus {
  open = 'open',
  closed = 'closed',
  preMarket = 'preMarket',
  afterHours = 'afterHours',
}

class Security extends BaseModel {
  ticker: string

  currency?: string | null

  type: SecurityType

  marketStatus?: SecurityMarketStatus | null

  fiscalYearEndMonth?: number | null

  currentPrice?: number | null

  dayChange?: number | null

  dayChangePercent?: number | null

  weekChange?: number | null

  weekChangePercent?: number | null

  extendedHoursPrice?: number | null

  extendedHoursChangePercent?: number | null

  high52Week?: number | null

  low52Week?: number | null

  marketCapitalization?: number | null

  sharesOutstanding?: number | null

  companyId: number | string | null

  company: Company

  static get tableName() {
    return 'securities'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['ticker', 'type'],
  }

  static get relationMappings() {
    return {
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: `${this.tableName}.companyId`,
          to: `${Company.tableName}.id`,
        },
      },
      financials: {
        relation: Model.HasManyRelation,
        modelClass: Financial,
        join: {
          from: `${this.tableName}.id`,
          to: `${Financial.tableName}.securityId`,
        },
      },
      followedSecurities: {
        relation: Model.HasManyRelation,
        modelClass: FollowedSecurity,
        join: {
          from: `${this.tableName}.id`,
          to: `${FollowedSecurity.tableName}.securityId`,
        },
      },
      userAccountSecurities: {
        relation: Model.HasManyRelation,
        modelClass: UserAccountSecurity,
        join: {
          from: `${this.tableName}.id`,
          to: `${UserAccountSecurity.tableName}.securityId`,
        },
      },
      historicalPrices: {
        relation: Model.HasManyRelation,
        modelClass: HistoricalPrice,
        join: {
          from: `${this.tableName}.id`,
          to: `${HistoricalPrice.tableName}.securityId`,
        },
      },
    }
  }

  static getPriceUpdateFromQuote(
    quote: Partial<SecurityQuoteResult> = {}
  ): PartialModelObject<Security> {
    return {
      ...(quote.price && { currentPrice: quote.price }),
      ...(quote.dayChange && { dayChange: quote.dayChange }),
      ...(quote.dayChangePercent && {
        dayChangePercent: quote.dayChangePercent,
      }),
      ...(Number.isFinite(quote.weekChange) && {
        weekChange: quote.weekChange,
      }),
      ...(Number.isFinite(quote.weekChangePercent) && {
        weekChangePercent: quote.weekChangePercent,
      }),
      ...(quote.high52w && { high52Week: quote.high52w }),
      ...(quote.low52w && { low52Week: quote.low52w }),
      ...(quote.sharesOutstanding && {
        sharesOutstanding: quote.sharesOutstanding / 1000000.0,
      }),
      ...(quote.marketCap && {
        marketCapitalization: quote.marketCap / 1000000.0,
      }),
      ...(!isUndefined(quote.extendedHoursPrice) && {
        extendedHoursPrice: quote.extendedHoursPrice,
      }),
      ...(!isUndefined(quote.extendedHoursChangePercentage) && {
        extendedHoursChangePercent: quote.extendedHoursChangePercentage,
      }),
      ...(!isUndefined(quote.marketStatus) && {
        marketStatus: quote.marketStatus,
      }),
    }
  }

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([unique(this, ['ticker'], queryContext.transaction)])

    return super.$beforeInsert(queryContext)
  }
}

class SecuritySearch {
  ticker: string

  name: string

  securityType: SecurityType
}

class PaginatedSecurity extends PaginatedClass(Security) {}

export {
  Security,
  SecuritySearch,
  PaginatedSecurity,
  SecurityType,
  SecurityMarketStatus,
}
