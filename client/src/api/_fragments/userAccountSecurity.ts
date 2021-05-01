import { gql } from '@apollo/client'

import securityFragment from '@api/_fragments/security'

const userAccountSecurityFragment = gql`
  fragment UserAccountSecurityFragment on UserAccountSecurity {
    id
    name
    profit
    volume
    openPrice
    currency
    openedAt
    security {
      ...SecurityFragment
    }
  }
  ${securityFragment}
`

export default userAccountSecurityFragment
