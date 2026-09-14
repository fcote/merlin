import { BaseModel } from '@models/base'
import { SoftDeleteQueryBuilder } from '@models/base/queryBuilder'

class SoftDeleteModel extends BaseModel {
  deletedAt?: Date

  QueryBuilderType!: SoftDeleteQueryBuilder<this>
  // @ts-ignore
  static QueryBuilder: SoftDeleteQueryBuilder = SoftDeleteQueryBuilder
}

export { SoftDeleteModel }
