import { JSONSchema, QueryContext, Model, PartialModelObject } from 'objection'

import { SecurityFinancialResult } from '@links/types'
import { BaseModel } from '@models/base'
import { unique } from '@models/base/validationMethods'
import { Financial } from '@models/financial'
import { PaginatedClass } from '@resolvers/paginated'

enum FinancialUnit {
  millions = 'millions',
  unit = 'unit',
  percent = 'percent',
  days = 'days',
}

enum FinancialUnitType {
  ratio = 'ratio',
  amount = 'amount',
  currency = 'currency',
}

enum FinancialRatioStatement {
  liquidityRatios = 'liquidity-ratios',
  profitabilityRatios = 'profitability-ratios',
  debtRatios = 'debt-ratios',
  cashFlowRatios = 'cash-flow-ratios',
  operatingPerformanceRatios = 'operating-performance-ratios',
  valuationRatios = 'valuation-ratios',
}

enum FinancialBaseStatement {
  incomeStatement = 'income-statement',
  balanceSheet = 'balance-sheet-statement',
  cashFlowStatement = 'cash-flow-statement',
}

type FinancialStatement = FinancialRatioStatement | FinancialBaseStatement

const FinancialStatementType = Object.assign(
  {},
  FinancialRatioStatement,
  FinancialBaseStatement
)

enum FinancialItemType {
  statement = 'statement',
  ratio = 'ratio',
}

enum FinancialItemDirection {
  ascending = 'asc',
  descending = 'desc',
}

class FinancialItem extends BaseModel {
  slug: string

  label: string

  type: FinancialItemType

  statement: FinancialStatement

  unit: FinancialUnit

  unitType: FinancialUnitType

  index: number

  isMain: boolean

  latexDescription?: string

  direction?: FinancialItemDirection

  static get tableName() {
    return 'financial_items'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: [
      'slug',
      'label',
      'type',
      'statement',
      'unit',
      'unitType',
      'index',
      'isMain',
    ],
  }

  static get relationMappings() {
    return {
      financials: {
        relation: Model.HasManyRelation,
        modelClass: Financial,
        join: {
          from: `${this.tableName}.id`,
          to: `${Financial.tableName}.financial_item_id`,
        },
      },
    }
  }

  static format(
    rawFinancialItem: SecurityFinancialResult,
    type: FinancialItemType,
    existingFinancialItem?: Partial<FinancialItem>
  ): PartialModelObject<FinancialItem> | undefined {
    const isNoOp = () => {
      if (!existingFinancialItem) return false
      return [
        'slug',
        'label',
        'statement',
        'index',
        'unit',
        'unitType',
        'isMain',
        'latexDescription',
        'direction',
      ].every((key) => {
        const k = key as
          | 'slug'
          | 'label'
          | 'statement'
          | 'index'
          | 'unit'
          | 'unitType'
          | 'isMain'
          | 'latexDescription'
          | 'direction'
        return (rawFinancialItem[k] ?? null) === existingFinancialItem[k]
      })
    }

    if (isNoOp()) return

    return {
      ...(existingFinancialItem && { id: existingFinancialItem.id }),
      type,
      slug: rawFinancialItem.slug,
      label: rawFinancialItem.label,
      statement: rawFinancialItem.statement,
      index: rawFinancialItem.index,
      unit: rawFinancialItem.unit,
      unitType: rawFinancialItem.unitType,
      isMain: rawFinancialItem.isMain,
      latexDescription: rawFinancialItem.latexDescription,
      direction: rawFinancialItem.direction,
    } as Partial<FinancialItem>
  }

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([
      unique(this, ['slug', 'statement'], queryContext.transaction),
    ])

    return super.$beforeInsert(queryContext)
  }
}

class PaginatedFinancialItem extends PaginatedClass(FinancialItem) {}

export {
  FinancialItem,
  PaginatedFinancialItem,
  FinancialRatioStatement,
  FinancialStatement,
  FinancialStatementType,
  FinancialBaseStatement,
  FinancialItemType,
  FinancialItemDirection,
  FinancialUnit,
  FinancialUnitType,
}
