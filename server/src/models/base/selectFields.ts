import { intersection } from 'lodash'
import { getMetadataStorage } from 'type-graphql'

import { BaseModel } from '@models/base'
import { SoftDeleteModel } from '@models/base/softDeleteModel'
import { FieldList } from '@resolvers/fields'

const selectableFields = (modelClass: typeof BaseModel) => {
  const models = getMetadataStorage().objectTypes.filter((o) =>
    [BaseModel.name, SoftDeleteModel.name, modelClass.name].includes(o.name)
  )
  return models.flatMap((c) =>
    c.fields?.filter((f) => !f.params?.length).map((f) => f.name)
  )
}

const selectFields = (
  fields: FieldList | undefined,
  modelClass: typeof BaseModel
): string[] => {
  if (!fields) return [`${modelClass.tableName}.*`]
  return intersection(fields, selectableFields(modelClass)).map(
    (f) => `${modelClass.tableName}.${f}`
  )
}

export { selectFields }
