import { Model, Page, QueryBuilder } from 'objection'

class SoftDeleteQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<
  M,
  R
> {
  ArrayQueryBuilderType!: SoftDeleteQueryBuilder<M, M[]>
  SingleQueryBuilderType!: SoftDeleteQueryBuilder<M, M>
  NumberQueryBuilderType!: SoftDeleteQueryBuilder<M, number>
  PageQueryBuilderType!: SoftDeleteQueryBuilder<M, Page<M>>

  constructor(modelClass: any) {
    // @ts-ignore objection.js QueryBuilder typing is missing constructor definition
    super(modelClass)
    const { tableName } = super.modelClass()

    super.onBuild((builder) => {
      if (!builder.context().withArchived) {
        builder.whereNull(`${tableName}.deletedAt`)
      }
    })
  }

  withArchived = (withArchived: boolean) => {
    super.context().withArchived = !!withArchived
    return this
  }

  softDelete = () => {
    const deletePatch: any = { deletedAt: new Date() }
    return super.patch(deletePatch)
  }
}

export { SoftDeleteQueryBuilder }
