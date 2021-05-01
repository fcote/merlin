import { CacheScope } from 'apollo-cache-control'
import { round } from 'lodash'
import { JSONSchema, QueryContext, Model } from 'objection'
import {
  registerEnumType,
  ObjectType,
  Field,
  Float,
  Int,
  ID,
} from 'type-graphql'

import { SecurityFinancialResult } from '@links/types'
import { Security } from '@models/./security'
import { BaseModel } from '@models/base'
import { unique } from '@models/base/validationMethods'
import { FinancialItem } from '@models/financialItem'
import { Sector } from '@models/sector'
import { TypeCacheControl } from '@resolvers/cacheControl'
import { PaginatedClass } from '@resolvers/paginated'

enum FinancialPerformanceGrade {
  aPlus = 'A+',
  a = 'A',
  aMinus = 'A-',
  bPlus = 'B+',
  b = 'B',
  bMinus = 'B-',
  cPlus = 'C+',
  c = 'C',
  cMinus = 'C-',
}

registerEnumType(FinancialPerformanceGrade, {
  name: 'FinancialPerformanceGrade',
})

@ObjectType('FinancialPerformance')
class FinancialPerformance {
  @Field((_) => FinancialPerformanceGrade, { nullable: true })
  grade: FinancialPerformanceGrade
  @Field((_) => Float)
  sectorValue: number
  @Field((_) => Float)
  diffPercent: number
}

enum FinancialFreq {
  Q = 'Q',
  Y = 'Y',
  TTM = 'TTM',
}

registerEnumType(FinancialFreq, {
  name: 'FinancialFreq',
})

enum FinancialPeriod {
  Y = 'Y',
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
  TTM = 'TTM',
}

registerEnumType(FinancialPeriod, {
  name: 'FinancialPeriod',
})

@TypeCacheControl({ maxAge: 60 * 60 * 24, scope: CacheScope.Public })
@ObjectType('Financial')
class Financial extends BaseModel {
  @Field((_) => Float, { nullable: true })
  value: number
  @Field((_) => Int)
  year: number
  @Field((_) => FinancialPeriod)
  period: FinancialPeriod
  @Field((_) => String)
  reportDate: string

  @Field((_) => ID, { nullable: true })
  securityId: number | string
  @Field((_) => ID, { nullable: true })
  sectorId: number | string
  @Field((_) => ID)
  financialItemId: number | string

  security: Security
  financialItem: FinancialItem

  static get tableName() {
    return 'financials'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['year', 'period', 'reportDate', 'financialItemId'],
    oneOf: [{ required: ['sectorId'] }, { required: ['securityId'] }],
  }

  static get relationMappings() {
    return {
      security: {
        relation: Model.BelongsToOneRelation,
        modelClass: Security,
        join: {
          from: `${this.tableName}.securityId`,
          to: `${Security.tableName}.id`,
        },
      },
      sector: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sector,
        join: {
          from: `${this.tableName}.securityId`,
          to: `${Sector.tableName}.id`,
        },
      },
      financialItem: {
        relation: Model.BelongsToOneRelation,
        modelClass: FinancialItem,
        join: {
          from: `${this.tableName}.financialItemId`,
          to: `${FinancialItem.tableName}.id`,
        },
      },
    }
  }

  static format(
    rawFinancial: SecurityFinancialResult,
    year: number,
    period: string,
    security: Security,
    existingFinancial: Partial<Financial>,
    existingFinancialItem: Partial<FinancialItem>
  ) {
    const isNoOp = () => {
      if (!existingFinancial) return false
      return (
        round(rawFinancial.value ?? null, 2) ===
        round(existingFinancial.value ?? null, 2)
      )
    }

    if (isNoOp()) return undefined

    return {
      ...(existingFinancial && { id: existingFinancial.id }),
      value: rawFinancial.value,
      year: year,
      period: period,
      reportDate: rawFinancial.reportDate,
      securityId: security.id,
      financialItemId: existingFinancialItem.id,
    }
  }

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([
      unique(
        this,
        ['financialItemId', 'securityId', 'sectorId', 'year', 'period'],
        queryContext.transaction
      ),
    ])

    return super.$beforeInsert(queryContext)
  }
}

@ObjectType('PaginatedFinancial')
class PaginatedFinancial extends PaginatedClass(Financial) {}

export {
  Financial,
  FinancialFreq,
  FinancialPeriod,
  FinancialPerformance,
  FinancialPerformanceGrade,
  PaginatedFinancial,
}
