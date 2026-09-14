import { collectSubFields } from '@graphql-tools/utils'
import { getNamedType, GraphQLResolveInfo, isObjectType } from 'graphql'

type FieldList = string[]

function getRequestedFields(info: GraphQLResolveInfo): FieldList {
  const returnType = getNamedType(info.returnType)
  if (!isObjectType(returnType)) return []
  const collect = (type: typeof returnType, nodes: typeof info.fieldNodes) =>
    collectSubFields(info.schema, info.fragments, info.variableValues, type, [
      ...nodes,
    ]).fields
  let fields = collect(returnType, info.fieldNodes)
  const nodes = [...fields.values()]
    .flat()
    .filter((node) => node.name.value === 'nodes')
  const itemType =
    returnType.getFields().nodes &&
    getNamedType(returnType.getFields().nodes.type)
  if (nodes.length && itemType && isObjectType(itemType)) {
    fields = collect(itemType, nodes)
  }
  return [
    ...new Set([...fields.values()].flat().map((node) => node.name.value)),
  ].filter((name) => name !== '__typename')
}

export { getRequestedFields, FieldList }
