import type { IResolvers } from '@graphql-tools/utils'

import type { RequestContext } from '@typings/context'

import { authenticated } from './authorization'
import { CompanyFieldsResolver } from './company/company.fields'
import { EarningFieldsResolver } from './earning/earning.fields'
import {
  EarningQueryResolver,
  SelfEarningQueryResolver,
} from './earning/earning.query'
import {
  EarningSubscriptionResolver,
  earningsChangesSubscribe,
} from './earning/earning.subscription'
import { getRequestedFields } from './fields'
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
import {
  NewsSubscriptionResolver,
  newsChangesSubscribe,
} from './news/news.subscription'
import { SelfQueryResolver, SelfMutationResolver } from './root'
import { SecurityFieldsResolver } from './security/security.fields'
import { SecurityMutationResolver } from './security/security.mutation'
import { SecurityQueryResolver } from './security/security.query'
import {
  SecuritySubscriptionResolver,
  securityPriceChangesSubscribe,
  securitySyncProgressChangesSubscribe,
} from './security/security.subscription'
import { StdLogQueryResolver } from './stdLog/stdLog.query'
import { UserFieldsResolver } from './user/user.fields'
import {
  UserMutationResolver,
  SelfUserMutationResolver,
} from './user/user.mutation'
import { SelfUserQueryResolver } from './user/user.query'
import { SelfUserAccountMutationResolver } from './userAccount/userAccount.mutation'
import { SelfUserAccountQueryResolver } from './userAccount/userAccount.query'
import { UserAccountSecurityFieldsResolver } from './userAccountSecurity/userAccountSecurity.fields'
import { SelfUserAccountSecurityQueryResolver as SelfUserAccountSecurityMutationResolver } from './userAccountSecurity/userAccountSecurity.mutation'
import { SelfUserAccountSecurityQueryResolver } from './userAccountSecurity/userAccountSecurity.query'
import { SelfUserTransactionQueryResolver as SelfUserTransactionMutationResolver } from './userTransaction/userTransaction.mutation'

const financialFieldsResolver = new FinancialFieldsResolver()
const financialQueryResolver = new FinancialQueryResolver()
const selfQueryResolver = new SelfQueryResolver()
const selfMutationResolver = new SelfMutationResolver()
const selfFollowedSecurityGroupQueryResolver =
  new SelfFollowedSecurityGroupQueryResolver()
const selfFollowedSecurityGroupMutationResolver =
  new SelfFollowedSecurityGroupMutationResolver()
const followedSecurityGroupFieldsResolver =
  new FollowedSecurityGroupFieldsResolver()
const userMutationResolver = new UserMutationResolver()
const selfUserMutationResolver = new SelfUserMutationResolver()
const selfUserQueryResolver = new SelfUserQueryResolver()
const userFieldsResolver = new UserFieldsResolver()
const securityQueryResolver = new SecurityQueryResolver()
const historicalPriceQueryResolver = new HistoricalPriceQueryResolver()
const securityFieldsResolver = new SecurityFieldsResolver()
const securitySubscriptionResolver = new SecuritySubscriptionResolver()
const securityMutationResolver = new SecurityMutationResolver()
const jobMutationResolver = new JobMutationResolver()
const selfUserAccountMutationResolver = new SelfUserAccountMutationResolver()
const selfUserAccountQueryResolver = new SelfUserAccountQueryResolver()
const stdLogQueryResolver = new StdLogQueryResolver()
const newsSubscriptionResolver = new NewsSubscriptionResolver()
const companyFieldsResolver = new CompanyFieldsResolver()
const newsQueryResolver = new NewsQueryResolver()
const userAccountSecurityFieldsResolver =
  new UserAccountSecurityFieldsResolver()
const selfUserAccountSecurityQueryResolver =
  new SelfUserAccountSecurityQueryResolver()
const selfUserAccountSecurityMutationResolver =
  new SelfUserAccountSecurityMutationResolver()
const selfUserTransactionMutationResolver =
  new SelfUserTransactionMutationResolver()
const forexQueryResolver = new ForexQueryResolver()
const financialItemQueryResolver = new FinancialItemQueryResolver()
const selfFollowedSecurityMutationResolver =
  new SelfFollowedSecurityMutationResolver()
const followedSecurityFieldsResolver = new FollowedSecurityFieldsResolver()
const earningSubscriptionResolver = new EarningSubscriptionResolver()
const earningFieldsResolver = new EarningFieldsResolver()
const earningQueryResolver = new EarningQueryResolver()
const selfEarningQueryResolver = new SelfEarningQueryResolver()

export const fieldResolvers: IResolvers<any, RequestContext> = {
  Financial: {
    security: (_root, _args, _context, _info) =>
      financialFieldsResolver.security(_root, _context),
    financialItem: (_root, _args, _context, _info) =>
      financialFieldsResolver.financialItem(_root, _context),
    performance: (_root, _args, _context, _info) =>
      financialFieldsResolver.performance(_root, _context),
  },
  Query: {
    financials: authenticated((_root, _args, _context, _info) =>
      financialQueryResolver.financials(
        _context,
        getRequestedFields(_info),
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    self: (_root, _args, _context, _info) => selfQueryResolver.self(),
    searchSecurity: authenticated((_root, _args, _context, _info) =>
      securityQueryResolver.searchSecurity(_args['ticker'])
    ),
    security: authenticated((_root, _args, _context, _info) =>
      securityQueryResolver.security(_args['ticker'], _context)
    ),
    historicalPrices: authenticated((_root, _args, _context, _info) =>
      historicalPriceQueryResolver.historicalPrices(
        _context,
        getRequestedFields(_info),
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    stdLogs: authenticated((_root, _args, _context, _info) =>
      stdLogQueryResolver.stdLogs(_context, _args['paginate'], _args['orderBy'])
    ),
    news: authenticated((_root, _args, _context, _info) =>
      newsQueryResolver.news(
        _context,
        getRequestedFields(_info),
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    forex: authenticated((_root, _args, _context, _info) =>
      forexQueryResolver.forex(
        _context,
        getRequestedFields(_info),
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    financialItems: authenticated((_root, _args, _context, _info) =>
      financialItemQueryResolver.financialItems(
        _context,
        getRequestedFields(_info),
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    earnings: authenticated((_root, _args, _context, _info) =>
      earningQueryResolver.earnings(
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    earningCallTranscript: authenticated((_root, _args, _context, _info) =>
      earningQueryResolver.earningCallTranscript(_context, _args['earningId'])
    ),
  },
  Mutation: {
    self: (_root, _args, _context, _info) => selfMutationResolver.self(),
    userSignUp: (_root, _args, _context, _info) =>
      userMutationResolver.userSignUp(_args['inputs'], _context),
    userSignIn: (_root, _args, _context, _info) =>
      userMutationResolver.userSignIn(_args['inputs'], _context),
    syncSecurity: authenticated((_root, _args, _context, _info) =>
      securityMutationResolver.syncSecurity(_args['ticker'], _context)
    ),
    syncSecurityPrices: authenticated((_root, _args, _context, _info) =>
      securityMutationResolver.syncSecurityPrices(_args['tickers'], _context)
    ),
    executeJob: authenticated((_root, _args, _context, _info) =>
      jobMutationResolver.executeJob(_context, _args['type'])
    ),
  },
  SelfQuery: {
    followedSecurityGroups: authenticated((_root, _args, _context, _info) =>
      selfFollowedSecurityGroupQueryResolver.followedSecurityGroups(
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    user: authenticated((_root, _args, _context, _info) =>
      selfUserQueryResolver.user(_context)
    ),
    userAccounts: authenticated((_root, _args, _context, _info) =>
      selfUserAccountQueryResolver.userAccounts(
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    userAccountSecurities: authenticated((_root, _args, _context, _info) =>
      selfUserAccountSecurityQueryResolver.userAccountSecurities(
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
    earnings: authenticated((_root, _args, _context, _info) =>
      selfEarningQueryResolver.earnings(
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      )
    ),
  },
  SelfMutation: {
    upsertFollowedSecurityGroup: authenticated(
      (_root, _args, _context, _info) =>
        selfFollowedSecurityGroupMutationResolver.upsertFollowedSecurityGroup(
          _args['inputs'],
          _context
        )
    ),
    updateUser: authenticated((_root, _args, _context, _info) =>
      selfUserMutationResolver.updateUser(_args['inputs'], _context)
    ),
    syncUserAccount: authenticated((_root, _args, _context, _info) =>
      selfUserAccountMutationResolver.syncUserAccount(_args['inputs'], _context)
    ),
    upsertUserAccount: authenticated((_root, _args, _context, _info) =>
      selfUserAccountMutationResolver.upsertUserAccount(
        _args['inputs'],
        _context
      )
    ),
    upsertUserAccountSecurity: authenticated((_root, _args, _context, _info) =>
      selfUserAccountSecurityMutationResolver.upsertUserAccountSecurity(
        _args['inputs'],
        _context
      )
    ),
    upsertUserTransaction: authenticated((_root, _args, _context, _info) =>
      selfUserTransactionMutationResolver.upsertUserTransaction(
        _args['inputs'],
        _context
      )
    ),
    linkFollowedSecurity: authenticated((_root, _args, _context, _info) =>
      selfFollowedSecurityMutationResolver.linkFollowedSecurity(
        _args['inputs'],
        _context
      )
    ),
    unlinkFollowedSecurity: authenticated((_root, _args, _context, _info) =>
      selfFollowedSecurityMutationResolver.unlinkFollowedSecurity(
        _args['inputs'],
        _context
      )
    ),
  },
  FollowedSecurityGroup: {
    followedSecurities: (_root, _args, _context, _info) =>
      followedSecurityGroupFieldsResolver.followedSecurities(
        _root,
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      ),
  },
  User: {
    transactions: (_root, _args, _context, _info) =>
      userFieldsResolver.transactions(
        _root,
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      ),
    accounts: (_root, _args, _context, _info) =>
      userFieldsResolver.accounts(
        _root,
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      ),
    accountSecurities: (_root, _args, _context, _info) =>
      userFieldsResolver.accountSecurities(
        _root,
        _context,
        _args['filters'],
        _args['paginate'],
        _args['orderBy']
      ),
    monthlyForecast: (_root, _args, _context, _info) =>
      userFieldsResolver.monthlyForecast(_root, _context, _args['nMonth']),
    monthlyExpenses: (_root, _args, _context, _info) =>
      userFieldsResolver.monthlyExpenses(_root, _context),
    accountTotalBalance: (_root, _args, _context, _info) =>
      userFieldsResolver.accountTotalBalance(_root, _context),
    incomePerMonthBeforeTaxes: (_root, _args, _context, _info) =>
      userFieldsResolver.incomePerMonthBeforeTaxes(_root),
    netIncomePerMonth: (_root, _args, _context, _info) =>
      userFieldsResolver.netIncomePerMonth(_root),
  },
  Security: {
    company: (_root, _args, _context, _info) =>
      securityFieldsResolver.company(_root, _context),
    followedIn: (_root, _args, _context, _info) =>
      securityFieldsResolver.followedIn(_root, _context),
  },
  Subscription: {
    securityPriceChanges: {
      subscribe: authenticated((_root, _args, _context, _info) =>
        securityPriceChangesSubscribe({
          args: _args,
          context: _context,
          info: _info,
        })
      ),
      resolve: authenticated((_root, _args, _context, _info) =>
        securitySubscriptionResolver.securityPriceChanges(
          _root,
          _args['tickers']
        )
      ),
    },
    securitySyncProgressChanges: {
      subscribe: authenticated((_root, _args, _context, _info) =>
        securitySyncProgressChangesSubscribe({
          args: _args,
          context: _context,
          info: _info,
        })
      ),
      resolve: authenticated((_root, _args, _context, _info) =>
        securitySubscriptionResolver.securitySyncProgressChanges(
          _root,
          _args['ticker']
        )
      ),
    },
    newsChanges: {
      subscribe: authenticated((_root, _args, _context, _info) =>
        newsChangesSubscribe({ args: _args, context: _context, info: _info })
      ),
      resolve: authenticated((_root, _args, _context, _info) =>
        newsSubscriptionResolver.newsChanges(_root, _args['tickers'])
      ),
    },
    earningsChanges: {
      subscribe: authenticated((_root, _args, _context, _info) =>
        earningsChangesSubscribe({
          args: _args,
          context: _context,
          info: _info,
        })
      ),
      resolve: authenticated((_root, _args, _context, _info) =>
        earningSubscriptionResolver.earningsChanges(_root, _args['tickers'])
      ),
    },
  },
  Company: {
    sector: (_root, _args, _context, _info) =>
      companyFieldsResolver.sector(_root, _context),
    industry: (_root, _args, _context, _info) =>
      companyFieldsResolver.industry(_root, _context),
  },
  UserAccountSecurity: {
    security: (_root, _args, _context, _info) =>
      userAccountSecurityFieldsResolver.security(_root, _context),
  },
  FollowedSecurity: {
    security: (_root, _args, _context, _info) =>
      followedSecurityFieldsResolver.security(_root, _context),
    followedSecurityGroup: (_root, _args, _context, _info) =>
      followedSecurityFieldsResolver.followedSecurityGroup(_root, _context),
  },
  Earning: {
    security: (_root, _args, _context, _info) =>
      earningFieldsResolver.security(_root, _context),
  },
}
