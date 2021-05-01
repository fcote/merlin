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
  speaker: string
  @Field((_) => String)
  statement: string
}

@ObjectType('Earning')
class Earning extends BaseModel {
  @Field((_) => String)
  date: string
  @Field((_) => Int, { nullable: true })
  fiscalYear?: number
  @Field((_) => Int, { nullable: true })
  fiscalQuarter?: number
  @Field((_) => EarningTime, { nullable: true })
  time: EarningTime
  @Field((_) => Float, { nullable: true })
  epsEstimate: number
  @Field((_) => Float, { nullable: true })
  eps: number
  @Field((_) => Float, { nullable: true })
  revenue: number
  @Field((_) => Float, { nullable: true })
  revenueEstimate: number
  @Field((_) => Float, { nullable: true })
  epsSurprisePercent: number
  @Field((_) => Float, { nullable: true })
  revenueSurprisePercent: number
  @Field((_) => [EarningStatement], { nullable: true })
  callTranscript: EarningStatement[]

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
      const cleanStatement = statement
        .replace(nextSpeaker, '') // trim the next speaker at the end of the statement
        .replace(/ ([$\d.,%]+) /g, ' **$1** ') // all numbers to bold
        .trim()

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
