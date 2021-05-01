import { isUndefined } from 'lodash'
import { JSONSchema, QueryContext, Model } from 'objection'
import {
  registerEnumType,
  ObjectType,
  Field,
  Float,
  ID,
  Int,
} from 'type-graphql'

import { SecurityQuoteResult } from '@links/types'
import { BaseModel } from '@models/base'
import { unique } from '@models/base/validationMethods'
import { Company } from '@models/company'
import { Financial } from '@models/financial'
import { FollowedSecurity } from '@models/followedSecurity'
import { HistoricalPrice } from '@models/historicalPrice'
import { PaginatedClass } from '@resolvers/paginated'

enum SecurityType {
  commonStock = 'Common Stock',
  commodity = 'Commodity',
  etf = 'ETF',
  index = 'Index',
  mutualFund = 'Mutual Fund',
}

registerEnumType(SecurityType, {
  name: 'SecurityType',
})

enum SecurityMarketStatus {
  open = 'open',
  closed = 'closed',
  preMarket = 'preMarket',
  afterHours = 'afterHours',
}

registerEnumType(SecurityMarketStatus, {
  name: 'SecurityMarketStatus',
})

@ObjectType('Security')
class Security extends BaseModel {
  @Field((_) => String)
  ticker: string
  @Field((_) => String, { nullable: true })
  currency: string
  @Field((_) => SecurityType)
  type: SecurityType
  @Field((_) => SecurityMarketStatus, { nullable: true })
  marketStatus?: SecurityMarketStatus
  @Field((_) => Int, { nullable: true })
  fiscalYearEndMonth?: number

  @Field((_) => Float, { nullable: true })
  currentPrice: number
  @Field((_) => Float, { nullable: true })
  dayChange: number
  @Field((_) => Float, { nullable: true })
  dayChangePercent: number
  @Field((_) => Float, { nullable: true })
  weekChange: number
  @Field((_) => Float, { nullable: true })
  weekChangePercent: number
  @Field((_) => Float, { nullable: true })
  extendedHoursPrice: number
  @Field((_) => Float, { nullable: true })
  extendedHoursChangePercent: number
  @Field((_) => Float, { nullable: true })
  high52Week: number
  @Field((_) => Float, { nullable: true })
  low52Week: number
  @Field((_) => Float, { nullable: true })
  marketCapitalization: number
  @Field((_) => Float, { nullable: true })
  sharesOutstanding: number

  @Field((_) => ID, { nullable: true })
  companyId: number | string

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
  ): Partial<Security> {
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

@ObjectType('SecuritySearch')
class SecuritySearch {
  @Field((_) => String)
  ticker: string
  @Field((_) => String)
  name: string
  @Field((_) => SecurityType)
  securityType: SecurityType
}

@ObjectType('PaginatedSecurity')
class PaginatedSecurity extends PaginatedClass(Security) {}

export {
  Security,
  SecuritySearch,
  PaginatedSecurity,
  SecurityType,
  SecurityMarketStatus,
}
