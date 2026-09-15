import { round } from 'lodash'
import { JSONSchema, Model, PartialModelObject } from 'objection'

import { SecurityFinancialResult } from '@links/types'
import { Security } from '@models/./security'
import { BaseModel } from '@models/base'
import { FinancialItem } from '@models/financialItem'
import { Sector } from '@models/sector'
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

class FinancialPerformance {
  grade?: FinancialPerformanceGrade | null

  sectorValue: number

  diffPercent?: number | null
}

enum FinancialFreq {
  Q = 'Q',
  Y = 'Y',
  TTM = 'TTM',
}

enum FinancialPeriod {
  Y = 'Y',
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
  TTM = 'TTM',
}

class Financial extends BaseModel {
  value?: number | null

  year: number | null

  period: FinancialPeriod

  reportDate: string

  isEstimate: boolean

  securityId: number | string

  sectorId: number | string

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
    year: number | null,
    period: string,
    security: Security,
    existingFinancial?: Financial,
    existingFinancialItem?: Partial<FinancialItem>
  ): PartialModelObject<Financial> | undefined {
    const isNoOp = () => {
      if (
        !existingFinancial ||
        (existingFinancial.isEstimate && !rawFinancial.isEstimate)
      ) {
        return false
      }
      if (!existingFinancial.isEstimate && rawFinancial.isEstimate) {
        return true
      }
      return (
        round(rawFinancial.value ?? NaN, 2) ===
        round(existingFinancial.value ?? NaN, 2)
      )
    }

    const noOp = isNoOp()
    if (noOp) return

    return {
      ...(existingFinancial && { id: existingFinancial.id }),
      value: rawFinancial.value,
      isEstimate: rawFinancial.isEstimate,
      year: year,
      period: period as FinancialPeriod,
      reportDate: rawFinancial.reportDate,
      securityId: security.id,
      financialItemId: existingFinancialItem?.id,
    }
  }
}

class PaginatedFinancial extends PaginatedClass(Financial) {}

export {
  Financial,
  FinancialFreq,
  FinancialPeriod,
  FinancialPerformance,
  FinancialPerformanceGrade,
  PaginatedFinancial,
}
