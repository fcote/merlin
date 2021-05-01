interface KnexEventObject {
  method: string
  bindings: any[]
  sql: string
  returning: string
  response: {
    rowCount: number
  }
}

interface KnexEventBuilderObject {
  _single?: {
    returning: string
    insert?: any[]
    table: string
  }
  _method: string
}

const eventMethods = ['insert', 'update']

export { KnexEventObject, KnexEventBuilderObject, eventMethods }
