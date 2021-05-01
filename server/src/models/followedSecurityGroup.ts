import { JSONSchema, Model, Transaction } from 'objection'
import { registerEnumType, ObjectType, Field, Int, ID } from 'type-graphql'

import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { FollowedSecurity } from '@models/followedSecurity'
import { Security } from '@models/security'
import { User } from '@models/user'
import { PaginatedClass } from '@resolvers/paginated'
import {
  ApolloResourceNotFound,
  ApolloForbidden,
} from '@typings/errors/apolloErrors'

enum FollowedSecurityGroupType {
  tracker = 'tracker',
  watchlist = 'watchlist',
}

registerEnumType(FollowedSecurityGroupType, {
  name: 'FollowedSecurityGroupType',
})

@ObjectType('FollowedSecurityGroup')
class FollowedSecurityGroup extends SoftDeleteModel {
  @Field((_) => String)
  name: string
  @Field((_) => Int)
  index: number
  @Field((_) => FollowedSecurityGroupType)
  type: FollowedSecurityGroupType

  @Field((_) => ID)
  userId: string

  static get tableName() {
    return 'followed_security_groups'
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name', 'userId'],
  }

  static checkOwnership = async (
    id: number | string,
    userId: string,
    trx?: Transaction
  ) => {
    if (!id) return

    const followedSecurityGroup = await FollowedSecurityGroup.query(
      trx
    ).findById(id)
    if (!followedSecurityGroup) {
      throw new ApolloResourceNotFound('GROUP_NOT_FOUND')
    }
    if (followedSecurityGroup.userId !== userId) {
      throw new ApolloForbidden('ACCESS_DENIED')
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.securityId`,
          to: `${User.tableName}.id`,
        },
      },
      securities: {
        relation: Model.ManyToManyRelation,
        modelClass: Security,
        join: {
          from: `${this.tableName}.id`,
          through: {
            modelClass: FollowedSecurity,
            from: `${FollowedSecurity.tableName}.followed_security_group_id`,
            to: `${FollowedSecurity.tableName}.security_id`,
            extra: ['technicalAnalysis', 'alias', 'index'],
          },
          to: `${Security.tableName}.id`,
        },
      },
    }
  }
}

@ObjectType('PaginatedFollowedSecurityGroup')
class PaginatedFollowedSecurityGroup extends PaginatedClass(
  FollowedSecurityGroup
) {}

export {
  FollowedSecurityGroup,
  PaginatedFollowedSecurityGroup,
  FollowedSecurityGroupType,
}
