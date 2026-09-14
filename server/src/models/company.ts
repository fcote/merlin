import { JSONSchema, QueryContext, Model } from 'objection'

import { BaseModel } from '@models/base'
import { unique } from '@models/base/validationMethods'
import { Industry } from '@models/industry'
import { Sector } from '@models/sector'
import { Security } from '@models/security'

class Company extends BaseModel {
  name: string

  cik: string

  isin: string

  cusip: string

  employees: number

  address: string

  description: string

  sectorId: number | string

  industryId: number | string

  securities: Security[]

  static get tableName() {
    return 'companies'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name'],
  }

  static get relationMappings() {
    return {
      sector: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sector,
        join: {
          from: `${this.tableName}.sectorId`,
          to: `${Sector.tableName}.id`,
        },
      },
      industry: {
        relation: Model.BelongsToOneRelation,
        modelClass: Industry,
        join: {
          from: `${this.tableName}.industryId`,
          to: `${Sector.tableName}.id`,
        },
      },
      securities: {
        relation: Model.HasManyRelation,
        modelClass: Security,
        join: {
          from: `${this.tableName}.id`,
          to: `${Security.tableName}.companyId`,
        },
      },
    }
  }

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([unique(this, ['name'], queryContext.transaction)])

    return super.$beforeInsert(queryContext)
  }
}

export { Company }
