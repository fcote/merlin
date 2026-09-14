interface Paginated<TItem> {
  total: number
  nodes: TItem[]
}

class OrderOptions {
  field: string

  direction: 'asc' | 'desc'
}

class PaginationOptions {
  limit: number

  offset: number
}

function PaginatedClass<TItem extends object>(
  _TItemClass: new (...args: any[]) => TItem
) {
  abstract class NewPaginatedClass {
    nodes: TItem[]

    total: number
  }

  return NewPaginatedClass
}

export { PaginationOptions, OrderOptions, Paginated, PaginatedClass }
