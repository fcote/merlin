import { GraphQLScalarType } from 'graphql'
import { GraphQLDateTimeISO } from 'graphql-scalars'
import { buildSchemaSync } from 'type-graphql'

import { pubSub } from '@pubSub'

import { authChecker, Right } from './authorization'
import { CompanyFieldsResolver } from './company/company.fields'
import { EarningFieldsResolver } from './earning/earning.fields'
import { EarningQueryResolver } from './earning/earning.query'
import { SelfEarningQueryResolver } from './earning/earning.query'
import { EarningSubscriptionResolver } from './earning/earning.subscription'
import { FinancialFieldsResolver } from './financial/financial.fields'
import { FinancialQueryResolver } from './financial/financial.query'
import { FinancialItemQueryResolver } from './financialItem/financialItem.query'
import { FollowedSecurityFieldsResolver } from './followedSecurity/followedSecurity.fields'
import { SelfFollowedSecurityQueryResolver as SelfFollowedSecurityMutationResolver } from './followedSecurity/followedSecurity.mutation'
import { FollowedSecurityGroupFieldsResolver } from './followedSecurityGroup/followedSecurityGroup.fields'
import { SelfFollowedSecurityGroupQueryResolver as SelfFollowedSecurityGroupMutationResolver } from './followedSecurityGroup/followedSecurityGroup.mutation'
import { SelfFollowedSecurityGroupQueryResolver } from './followedSecurityGroup/followedSecurityGroup.query'
import { ForexQueryResolver } from './forex/forex.query'
import { HistoricalPriceQueryResolver } from './historicalPrice/historicalPrice.query'
import { JobMutationResolver } from './job/job.mutation'
import { NewsQueryResolver } from './news/news.query'
import { NewsSubscriptionResolver } from './news/news.subscription'
import { SelfQueryResolver, SelfMutationResolver } from './root'
import { SecurityFieldsResolver } from './security/security.fields'
import { SecurityMutationResolver } from './security/security.mutation'
import { SecurityQueryResolver } from './security/security.query'
import { SecuritySubscriptionResolver } from './security/security.subscription'
import { StdLogQueryResolver } from './stdLog/stdLog.query'
import { UserFieldsResolver } from './user/user.fields'
import { UserMutationResolver } from './user/user.mutation'
import { SelfUserMutationResolver } from './user/user.mutation'
import { SelfUserQueryResolver } from './user/user.query'
import { SelfUserAccountMutationResolver } from './userAccount/userAccount.mutation'
import { SelfUserAccountQueryResolver } from './userAccount/userAccount.query'
import { UserAccountSecurityFieldsResolver } from './userAccountSecurity/userAccountSecurity.fields'
import { SelfUserAccountSecurityQueryResolver as SelfUserAccountSecurityMutationResolver } from './userAccountSecurity/userAccountSecurity.mutation'
import { SelfUserAccountSecurityQueryResolver } from './userAccountSecurity/userAccountSecurity.query'
import { SelfUserTransactionQueryResolver as SelfUserTransactionMutationResolver } from './userTransaction/userTransaction.mutation'

const schema = buildSchemaSync({
  resolvers: [
    SelfQueryResolver,
    SelfMutationResolver,
    CompanyFieldsResolver,
    EarningFieldsResolver,
    EarningQueryResolver,
    SelfEarningQueryResolver,
    EarningSubscriptionResolver,
    FinancialFieldsResolver,
    FinancialQueryResolver,
    FinancialItemQueryResolver,
    FollowedSecurityFieldsResolver,
    SelfFollowedSecurityMutationResolver,
    FollowedSecurityGroupFieldsResolver,
    SelfFollowedSecurityGroupMutationResolver,
    SelfFollowedSecurityGroupQueryResolver,
    ForexQueryResolver,
    HistoricalPriceQueryResolver,
    JobMutationResolver,
    NewsQueryResolver,
    NewsSubscriptionResolver,
    SecurityFieldsResolver,
    SecurityMutationResolver,
    SecurityQueryResolver,
    SecuritySubscriptionResolver,
    StdLogQueryResolver,
    UserFieldsResolver,
    UserMutationResolver,
    SelfUserMutationResolver,
    SelfUserQueryResolver,
    SelfUserAccountMutationResolver,
    SelfUserAccountQueryResolver,
    UserAccountSecurityFieldsResolver,
    SelfUserAccountSecurityMutationResolver,
    SelfUserAccountSecurityQueryResolver,
    SelfUserTransactionMutationResolver,
  ],
  authChecker,
  scalarsMap: [
    {
      type: Date,
      scalar: new GraphQLScalarType({
        ...GraphQLDateTimeISO.toConfig(),
        name: 'DateTime',
      }),
    },
  ],
  emitSchemaFile: {
    path: './schema.graphql',
  },
  pubSub: {
    publish: (topic, payload) => pubSub.publish(topic, payload),
    subscribe: (topic) => pubSub.asyncIterableIterator(topic),
  },
})

export { schema, Right }
