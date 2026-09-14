import { intersection } from 'lodash'

import { BaseModel } from '@models/base'
import { FieldList } from '@resolvers/fields'

import { databaseFields } from './databaseFields'

const selectFields = (
  fields: FieldList | undefined,
  modelClass: typeof BaseModel
): string[] => {
  if (!fields) return [`${modelClass.tableName}.*`]
  return intersection(fields, databaseFields[modelClass.tableName] ?? []).map(
    (field) => `${modelClass.tableName}.${field}`
  )
}

export { selectFields }
