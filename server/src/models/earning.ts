import { JSONSchema, Model } from 'objection'
import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
  Int,
} from 'type-graphql'

import { BaseModel } from '@models/base'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

enum EarningTime {
  beforeMarketOpen = 'before-market-open',
  afterMarketClose = 'after-market-close',
}

registerEnumType(EarningTime, {
  name: 'EarningTime',
})

@ObjectType('EarningStatement')
class EarningStatement {
  @Field((_) => String)
  speaker?: string
  @Field((_) => String)
  statement: string
}

@ObjectType('Earning')
class Earning extends BaseModel {
  @Field((_) => String)
  date: string
  @Field((_) => Int, { nullable: true })
  fiscalYear?: number | null
  @Field((_) => Int, { nullable: true })
  fiscalQuarter?: number | null
  @Field((_) => EarningTime, { nullable: true })
  time: EarningTime | null
  @Field((_) => Float, { nullable: true })
  epsEstimate?: number | null
  @Field((_) => Float, { nullable: true })
  eps?: number | null
  @Field((_) => Float, { nullable: true })
  revenue?: number | null
  @Field((_) => Float, { nullable: true })
  revenueEstimate?: number | null
  @Field((_) => Float, { nullable: true })
  epsSurprisePercent?: number | null
  @Field((_) => Float, { nullable: true })
  revenueSurprisePercent?: number | null
  @Field((_) => [EarningStatement], { nullable: true })
  callTranscript?: EarningStatement[] | null

  @Field((_) => ID)
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

@ObjectType('PaginatedEarning')
class PaginatedEarning extends PaginatedClass(Earning) {}

export { Earning, EarningTime, EarningStatement, PaginatedEarning }
