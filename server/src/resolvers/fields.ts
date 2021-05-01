import graphqlFields from 'graphql-fields'
import { createParamDecorator } from 'type-graphql'

type FieldList = string[]

function Fields(): ParameterDecorator {
  return createParamDecorator(
    ({ info }): FieldList => {
      const fields = graphqlFields(info, {}, { excludedFields: ['__typename'] })
      if (fields?.nodes) return Object.keys(fields.nodes)
      return Object.keys(fields)
    }
  )
}

export { Fields, FieldList }
