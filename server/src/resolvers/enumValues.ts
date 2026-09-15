// GraphQL enum names map to the existing stored domain values.
export const enumValues = {
  EarningTime: {
    beforeMarketOpen: 'before-market-open',
    afterMarketClose: 'after-market-close',
  },
  SecurityType: {
    commonStock: 'Common Stock',
    commodity: 'Commodity',
    etf: 'ETF',
    index: 'Index',
    mutualFund: 'Mutual Fund',
  },
  SecurityMarketStatus: {
    open: 'open',
    closed: 'closed',
    preMarket: 'preMarket',
    afterHours: 'afterHours',
  },
  FollowedSecurityGroupType: {
    tracker: 'tracker',
    watchlist: 'watchlist',
  },
  UserTransactionCategory: {
    subscription: 'subscription',
    groceries: 'groceries',
    extra: 'extra',
    rent: 'rent',
  },
  UserTransactionType: {
    income: 'income',
    expense: 'expense',
  },
  UserTransactionFrequency: {
    daily: 'daily',
    monthly: 'monthly',
    punctual: 'punctual',
  },
  UserAccountType: {
    saving: 'saving',
    securities: 'securities',
  },
  UserAccountProvider: {
    xtb: 'xtb',
  },
  FinancialPeriod: {
    Y: 'Y',
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
    TTM: 'TTM',
  },
  FinancialItemType: {
    statement: 'statement',
    ratio: 'ratio',
  },
  FinancialStatement: {
    liquidityRatios: 'liquidity-ratios',
    profitabilityRatios: 'profitability-ratios',
    debtRatios: 'debt-ratios',
    cashFlowRatios: 'cash-flow-ratios',
    operatingPerformanceRatios: 'operating-performance-ratios',
    valuationRatios: 'valuation-ratios',
    incomeStatement: 'income-statement',
    balanceSheet: 'balance-sheet-statement',
    cashFlowStatement: 'cash-flow-statement',
  },
  FinancialUnit: {
    millions: 'millions',
    unit: 'unit',
    percent: 'percent',
    days: 'days',
  },
  FinancialUnitType: {
    ratio: 'ratio',
    amount: 'amount',
    currency: 'currency',
  },
  FinancialItemDirection: {
    ascending: 'asc',
    descending: 'desc',
  },
  FinancialPerformanceGrade: {
    aPlus: 'A+',
    a: 'A',
    aMinus: 'A-',
    bPlus: 'B+',
    b: 'B',
    bMinus: 'B-',
    cPlus: 'C+',
    c: 'C',
    cMinus: 'C-',
  },
  FinancialFreq: {
    Q: 'Q',
    Y: 'Y',
    TTM: 'TTM',
  },
  NewsType: {
    standard: 'standard',
    pressRelease: 'press-release',
  },
  JobType: {
    newsSubscribed: 'newsSubscribed',
    earningsSubscribed: 'earningsSubscribed',
    pricesSubscribed: 'pricesSubscribed',
  },
}
