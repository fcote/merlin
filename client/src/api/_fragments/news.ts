import { gql } from '@apollo/client'

const news = gql`
  fragment NewsFragment on News {
    id
    date
    type
    title
    content
    website
    url
  }
`

export default news
