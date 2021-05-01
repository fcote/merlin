import { GraphQLDateTime } from 'graphql-iso-date'
import { ObjectType, Field } from 'type-graphql'

import { BaseModel } from '@models/base'
import { SoftDeleteQueryBuilder } from '@models/base/queryBuilder'

@ObjectType('SoftDeleteModel', { isAbstract: true })
class SoftDeleteModel extends BaseModel {
  @Field((_) => GraphQLDateTime, { nullable: true })
  deletedAt?: Date

  QueryBuilderType!: SoftDeleteQueryBuilder<this>
  // @ts-ignore
  static QueryBuilder: SoftDeleteQueryBuilder = SoftDeleteQueryBuilder
}

export { SoftDeleteModel }
