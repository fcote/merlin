import { InputType, Field } from 'type-graphql'

import { NewsType } from '@models/news'

@InputType('NewsFilters')
class NewsFilters {
  @Field((_) => String)
  ticker: string
  @Field((_) => NewsType, { nullable: true })
  type?: NewsType
}

export { NewsFilters }
