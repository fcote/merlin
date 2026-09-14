import { round } from 'lodash'
import { JSONSchema, Model } from 'objection'

import { SecurityHistoricalPriceResult } from '@links/types'
import { BaseModel } from '@models/base'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

class HistoricalPrice extends BaseModel {
  date: string

  open: number

  high: number

  low: number

  close: number

  volume: number // In millions

  change: number

  changePercent: number

  securityId: number | string

  security: Security

  static get tableName() {
    return 'historical_prices'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: [
      'date',
      'open',
      'high',
      'low',
      'close',
      'volume',
      'change',
      'changePercent',
    ],
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
    }
  }

  static format(
    rawHistoricalPrice: SecurityHistoricalPriceResult,
    security: Security,
    existingHistoricalPrice?: Partial<HistoricalPrice>
  ): Partial<HistoricalPrice | undefined> {
    const isNoOp = () => {
      if (!existingHistoricalPrice) return false
      return ['open', 'low', 'high', 'close', 'volume'].every((key) => {
        const k = key as 'open' | 'low' | 'high' | 'close' | 'volume'
        return (
          round(rawHistoricalPrice[k], 2) ===
          round(existingHistoricalPrice[k]!, 2)
        )
      })
    }

    if (isNoOp()) return

    return {
      ...(existingHistoricalPrice && { id: existingHistoricalPrice.id }),
      date: rawHistoricalPrice.date,
      open: rawHistoricalPrice.open,
      low: rawHistoricalPrice.low,
      high: rawHistoricalPrice.high,
      close: rawHistoricalPrice.close,
      change: rawHistoricalPrice.change,
      changePercent: rawHistoricalPrice.changePercent,
      volume: rawHistoricalPrice.volume,
      securityId: security.id,
    }
  }
}

class PaginatedHistoricalPrice extends PaginatedClass(HistoricalPrice) {}

export { HistoricalPrice, PaginatedHistoricalPrice }
