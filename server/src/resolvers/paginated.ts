import { ClassType, Field, InputType, Int, ObjectType } from 'type-graphql'

interface Paginated<TItem> {
  total: number
  nodes: TItem[]
}

@InputType()
class OrderOptions {
  @Field({ nullable: true })
  field: string
  @Field({ nullable: true })
  direction: 'asc' | 'desc'
}

@InputType()
class PaginationOptions {
  @Field((_) => Int)
  limit: number
  @Field((_) => Int)
  offset: number
}

function PaginatedClass<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType({})
  abstract class NewPaginatedClass {
    @Field((_) => [TItemClass])
    nodes: TItem[]

    @Field((_) => Int)
    total: number
  }

  return NewPaginatedClass
}

export { PaginationOptions, OrderOptions, Paginated, PaginatedClass }
