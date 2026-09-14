import { JSONSchema, QueryContext, Model } from 'objection'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { unique } from '@models/base/validationMethods'
import { FollowedSecurityGroup } from '@models/followedSecurityGroup'
import { Security } from '@models/security'
import { PaginatedClass } from '@resolvers/paginated'

class FollowedSecurity extends SoftDeleteModel {
  technicalAnalysis?: string

  alias?: string

  index?: number

  followedSecurityGroupId: string | number

  securityId: string | number

  static get tableName() {
    return 'followed_securities'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['followedSecurityGroupId', 'securityId'],
  }

  static get relationMappings() {
    return {
      followedSecurityGroup: {
        relation: Model.BelongsToOneRelation,
        modelClass: FollowedSecurityGroup,
        join: {
          from: `${this.tableName}.followedSecurityGroupId`,
          to: `${FollowedSecurityGroup.tableName}.id`,
        },
      },
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

  async $beforeInsert(queryContext: QueryContext) {
    await this.validate([
      unique(
        this,
        ['followedSecurityGroupId', 'securityId'],
        queryContext.transaction
      ),
    ])

    return super.$beforeInsert(queryContext)
  }
}

class PaginatedFollowedSecurity extends PaginatedClass(FollowedSecurity) {}

export { FollowedSecurity, PaginatedFollowedSecurity }
