export interface PaginationOptions {
  limit: number
  offset: number
}

export default interface Paginated<TItem> {
  total: number
  nodes: TItem[]
}
