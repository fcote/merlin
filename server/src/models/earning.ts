import { JSONSchema, Model } from 'objection'

import { BaseModel } from '@models/base'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

enum EarningTime {
  beforeMarketOpen = 'before-market-open',
  afterMarketClose = 'after-market-close',
}

class EarningStatement {
  speaker?: string

  statement: string
}

class Earning extends BaseModel {
  date: string

  fiscalYear?: number | null

  fiscalQuarter?: number | null

  time: EarningTime | null

  epsEstimate?: number | null

  eps?: number | null

  revenue?: number | null

  revenueEstimate?: number | null

  epsSurprisePercent?: number | null

  revenueSurprisePercent?: number | null

  callTranscript?: EarningStatement[] | null

  securityId: number | string

  security: Security

  static get tableName() {
    return 'earnings'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['date', 'securityId'],
  }

  static parseCallTranscript(earningsCall: string): EarningStatement[] {
    const splitEarningsCall = earningsCall.split(':')

    return splitEarningsCall.reduce((res, statement, i) => {
      if (i === 0) return res

      const speaker = splitEarningsCall[i - 1].split(/[.?!]/).pop()?.trim()
      const nextSpeaker = splitEarningsCall[i].split(/[.?!]/).pop()

      let cleanStatement = statement.replace(/ ([$\d.,%]+) /g, ' **$1** ')
      if (nextSpeaker) {
        cleanStatement.replace(nextSpeaker, '')
      }
      cleanStatement = cleanStatement.trim()

      return [...res, { speaker, statement: cleanStatement }]
    }, [] as EarningStatement[])
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
}

class PaginatedEarning extends PaginatedClass(Earning) {}

export { Earning, EarningTime, EarningStatement, PaginatedEarning }
