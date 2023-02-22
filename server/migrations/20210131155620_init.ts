import { Knex } from 'knex'

const TABLES = {
  USERS: 'users',
  USER_ACCOUNTS: 'user_accounts',
  USER_ACCOUNT_SECURITIES: 'user_account_securities',
  USER_TRANSACTIONS: 'user_transactions',
  SECTORS: 'sectors',
  INDUSTRIES: 'industries',
  COMPANIES: 'companies',
  SECURITIES: 'securities',
  NEWS: 'news',
  HISTORICAL_PRICES: 'historical_prices',
  EARNINGS: 'earnings',
  FINANCIALS: 'financials',
  FINANCIAL_ITEMS: 'financial_items',
  FOLLOWED_SECURITIES: 'followed_securities',
  FOLLOWED_SECURITY_GROUPS: 'followed_security_groups',
  FOREX: 'forex',
  STD_LOGS: 'std_logs',
  JOBS: 'jobs',
}

export async function up(knex: Knex): Promise<any> {
  await knex.schema.raw(`create extension if not exists "uuid-ossp"`)

  await knex.schema.createTable(TABLES.USERS, (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.string('username').notNullable().unique()
    t.string('password_pbkdf2').notNullable()
    t.string('password_salt').notNullable()
    t.integer('pbkdf2_iterations').notNullable()
    t.uuid('api_token').defaultTo(knex.raw('uuid_generate_v4()')).unique()
    t.integer('income_per_year').nullable()
    t.decimal('income_tax_rate', 4, 2)
    t.decimal('salary_charge_rate', 4, 2)
    t.string('currency').notNullable().defaultTo('USD')

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')
  })

  await knex.schema.createTable(TABLES.SECTORS, (t) => {
    t.increments('id')
    t.string('name').notNullable().unique()

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable(TABLES.INDUSTRIES, (t) => {
    t.increments('id')
    t.string('name').notNullable().unique()

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable(TABLES.COMPANIES, (t) => {
    t.increments('id')

    t.string('name').notNullable().unique()
    t.string('industry').index()
    t.integer('employees').index()
    t.string('address')
    t.text('description')
    t.string('cik').index()
    t.string('isin').index()
    t.string('cusip').index()

    t.integer('sector_id')
    t.foreign('sector_id').references(`${TABLES.SECTORS}.id`)
    t.integer('industry_id')
    t.foreign('industry_id').references(`${TABLES.INDUSTRIES}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable(TABLES.SECURITIES, (t) => {
    t.increments('id')

    t.string('ticker').notNullable().unique()
    t.string('currency')
    t.string('type').notNullable().index()
    t.integer('fiscal_year_end_month')
    t.string('market_status') // preMarket/afterHours
    t.double('current_price', 10, 2)
    t.double('day_change', 10, 2)
    t.double('day_change_percent', 5, 2)
    t.double('week_change', 10, 2)
    t.double('week_change_percent', 5, 2)
    t.double('extended_hours_price', 10, 2)
    t.double('extended_hours_change_percent', 5, 2)
    t.double('high52_week', 10, 2)
    t.double('low52_week', 10, 2)
    t.double('market_capitalization', 12, 2) // In millions
    t.double('shares_outstanding', 12, 2) // In millions

    t.integer('company_id')
    t.foreign('company_id').references(`${TABLES.COMPANIES}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable(TABLES.HISTORICAL_PRICES, (t) => {
    t.increments('id')

    t.string('date').notNullable()
    t.double('open', 10, 2)
    t.double('high', 10, 2)
    t.double('low', 10, 2)
    t.double('close', 10, 2)
    t.double('volume', 10, 2)
    t.double('change', 10, 2)
    t.double('change_percent', 10, 2)

    t.integer('security_id').notNullable()
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.raw(
    `create unique index historical_prices_security_id_date_unique on ${TABLES.HISTORICAL_PRICES} (security_id, date desc)`
  )

  await knex.schema.createTable(TABLES.EARNINGS, (t) => {
    t.increments('id')
    t.string('date').notNullable()
    t.integer('fiscal_year')
    t.integer('fiscal_quarter')
    t.string('time')
    t.double('eps_estimate', 10, 2)
    t.double('eps', 10, 2)
    t.double('eps_surprise_percent', 10, 2)
    t.double('revenue_estimate', 10, 2)
    t.double('revenue', 10, 2)
    t.double('revenue_surprise_percent', 10, 2)
    t.jsonb('call_transcript')

    t.integer('security_id').notNullable()
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.raw(
    `create unique index earnings_security_id_fiscal_year_fiscal_quarter_unique on ${TABLES.EARNINGS} (security_id, fiscal_year, fiscal_quarter)`
  )

  await knex.schema.createTable(TABLES.NEWS, (t) => {
    t.increments('id')
    t.timestamp('date').notNullable()
    t.string('type').notNullable()
    t.text('title').notNullable()
    t.text('content').notNullable()
    t.string('website')
    t.text('url')

    t.integer('security_id')
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    t.unique(['title', 'type', 'security_id'])
  })

  await knex.schema.createTable(TABLES.FOLLOWED_SECURITY_GROUPS, (t) => {
    t.increments('id')

    t.string('type').notNullable().defaultTo('tracker')
    t.string('name').notNullable()
    t.integer('index')

    t.uuid('user_id').notNullable()
    t.foreign('user_id').references(`${TABLES.USERS}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')
  })

  await knex.schema.createTable(TABLES.FOLLOWED_SECURITIES, (t) => {
    t.increments('id')

    t.string('alias')
    t.integer('index')
    t.text('technical_analysis')

    t.integer('security_id').notNullable()
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)
    t.integer('followed_security_group_id').notNullable()
    t.foreign('followed_security_group_id').references(
      `${TABLES.FOLLOWED_SECURITY_GROUPS}.id`
    )

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')

    t.unique(['security_id', 'followed_security_group_id'])
  })

  await knex.schema.createTable(TABLES.FINANCIAL_ITEMS, (t) => {
    t.increments('id')

    t.string('slug')
    t.string('type').notNullable().defaultTo('statement') // statement / ratio
    t.string('label').notNullable()
    t.string('statement').notNullable()
    t.string('unit').notNullable()
    t.string('unit_type').notNullable()
    t.integer('index').notNullable()
    t.boolean('is_main').notNullable().defaultTo(false)
    t.string('direction')
    t.string('latex_description')

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    t.unique(['slug', 'statement'])
  })

  await knex.schema.createTable(TABLES.FINANCIALS, (t) => {
    t.increments('id')

    t.double('value')
    t.integer('year').notNullable()
    t.string('period').notNullable()
    t.string('report_date').notNullable()
    t.boolean('is_estimate').notNullable().defaultTo(false)

    t.integer('security_id')
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)
    t.integer('sector_id')
    t.foreign('sector_id').references(`${TABLES.SECTORS}.id`)
    t.integer('financial_item_id').notNullable()
    t.foreign('financial_item_id').references(`${TABLES.FINANCIAL_ITEMS}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    t.unique(['financial_item_id', 'security_id', 'period', 'year'])
    t.unique(['financial_item_id', 'sector_id', 'period', 'year'])
    t.index(['security_id', 'period'])
  })

  await knex.schema.createTable(TABLES.USER_TRANSACTIONS, (t) => {
    t.increments('id')
    t.string('name').nullable()
    t.decimal('value', 12, 2).nullable()
    t.string('category').notNullable().defaultTo('extra') // subscription / groceries / extras
    t.string('type').notNullable() // expense / income
    t.string('frequency').notNullable() // daily / monthly / punctual
    t.timestamp('date').nullable()

    t.uuid('user_id').notNullable()
    t.foreign('user_id').references(`${TABLES.USERS}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')
  })

  await knex.schema.createTable(TABLES.USER_ACCOUNTS, (t) => {
    t.increments('id')
    t.string('name').notNullable()
    t.string('type').notNullable() // saving / securities
    t.string('provider') // xtb
    t.decimal('balance', 12, 2).notNullable().defaultTo(0)

    t.uuid('user_id').notNullable()
    t.foreign('user_id').references(`${TABLES.USERS}.id`)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')
  })

  await knex.schema.createTable(TABLES.USER_ACCOUNT_SECURITIES, (t) => {
    t.increments('id')
    t.string('name').notNullable()
    t.string('currency').notNullable()
    t.double('profit')
    t.double('volume').notNullable()
    t.double('open_price').notNullable()
    t.string('external_id')

    t.integer('user_account_id').notNullable()
    t.foreign('user_account_id').references(`${TABLES.USER_ACCOUNTS}.id`)
    t.integer('security_id')
    t.foreign('security_id').references(`${TABLES.SECURITIES}.id`)

    t.timestamp('opened_at').notNullable()
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('deleted_at')

    t.unique(['user_account_id', 'external_id'])
  })

  await knex.schema.createTable(TABLES.FOREX, (t) => {
    t.increments('id')
    t.string('from_currency').notNullable()
    t.string('to_currency').notNullable()
    t.double('exchange_rate')

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    t.unique(['from_currency', 'to_currency'])
  })

  await knex.schema.createTable(TABLES.STD_LOGS, (t) => {
    t.increments('id')

    t.string('level').notNullable()
    t.string('message').notNullable()
    t.jsonb('data').notNullable()

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable(TABLES.JOBS, (t) => {
    t.increments('id')
    t.string('type').notNullable()
    t.boolean('is_running').notNullable().defaultTo(false)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex
    .insert([
      {
        id: 1,
        slug: 'revenue',
        type: 'statement',
        label: 'Revenue',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 0,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 2,
        slug: 'costOfRevenue',
        type: 'statement',
        label: 'Cost of revenue',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 1,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 3,
        slug: 'grossProfit',
        type: 'statement',
        label: 'Gross profit',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 2,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 4,
        slug: 'researchAndDevelopmentExpenses',
        type: 'statement',
        label: 'R&D expenses',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 3,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 5,
        slug: 'generalAndAdministrativeExpenses',
        type: 'statement',
        label: 'SG&A expenses',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 4,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 6,
        slug: 'otherExpenses',
        type: 'statement',
        label: 'Other expenses',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 5,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 7,
        slug: 'operatingExpenses',
        type: 'statement',
        label: 'Operating expenses',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 6,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 8,
        slug: 'costAndExpenses',
        type: 'statement',
        label: 'Cost and expenses',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 7,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 9,
        slug: 'operatingIncome',
        type: 'statement',
        label: 'Operating income',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 8,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 10,
        slug: 'nonOperatingIncome',
        type: 'statement',
        label: 'Non-operating income',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 9,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 11,
        slug: 'incomeBeforeTax',
        type: 'statement',
        label: 'Income before tax',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 10,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 12,
        slug: 'incomeTaxExpense',
        type: 'statement',
        label: 'Income tax expense',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 11,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 13,
        slug: 'netIncome',
        type: 'statement',
        label: 'Net income',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 12,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 14,
        slug: 'interestExpense',
        type: 'statement',
        label: 'Interest expense',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 13,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 15,
        slug: 'ebit',
        type: 'statement',
        label: 'EBIT',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 14,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 16,
        slug: 'depreciationAndAmortization',
        type: 'statement',
        label: 'Depreciation and amortization',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 15,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 17,
        slug: 'ebitda',
        type: 'statement',
        label: 'EBITDA',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 16,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 18,
        slug: 'sharesOutstanding',
        type: 'statement',
        label: 'Shares outstanding',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'amount',
        index: 17,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 19,
        slug: 'sharesOutstandingDiluted',
        type: 'statement',
        label: 'Shares outstanding diluted',
        statement: 'income-statement',
        unit: 'millions',
        unit_type: 'amount',
        index: 18,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 20,
        slug: 'eps',
        type: 'statement',
        label: 'EPS',
        statement: 'income-statement',
        unit: 'unit',
        unit_type: 'currency',
        index: 19,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 21,
        slug: 'epsDiluted',
        type: 'statement',
        label: 'EPS Diluted',
        statement: 'income-statement',
        unit: 'unit',
        unit_type: 'currency',
        index: 20,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 22,
        slug: 'cashAndCashEquivalents',
        type: 'statement',
        label: 'Cash and cash equivalents',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 0,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 23,
        slug: 'shortTermInvestments',
        type: 'statement',
        label: 'Short-term investments',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 1,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 24,
        slug: 'receivables',
        type: 'statement',
        label: 'Receivables',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 2,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 25,
        slug: 'inventory',
        type: 'statement',
        label: 'Inventory',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 3,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 26,
        slug: 'otherCurrentAssets',
        type: 'statement',
        label: 'Other current assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 4,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 27,
        slug: 'totalCurrentAssets',
        type: 'statement',
        label: 'Total current assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 5,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 28,
        slug: 'propertyPlantAndEquipment',
        type: 'statement',
        label: 'Property, Plant, And Equipment',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 6,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 29,
        slug: 'goodwillAndIntangibleAssets',
        type: 'statement',
        label: 'Goodwill and Intangible assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 7,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 30,
        slug: 'longTermInvestments',
        type: 'statement',
        label: 'Long-term investments',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 8,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 31,
        slug: 'otherNonCurrentAssets',
        type: 'statement',
        label: 'Other non-current assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 9,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 32,
        slug: 'totalNonCurrentAssets',
        type: 'statement',
        label: 'Total non-current assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 10,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 33,
        slug: 'totalAssets',
        type: 'statement',
        label: 'Total assets',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 11,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 34,
        slug: 'payables',
        type: 'statement',
        label: 'Payables',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 12,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 35,
        slug: 'shortTermDebt',
        type: 'statement',
        label: 'Short-term debt',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 13,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 36,
        slug: 'deferredCurrentLiabilities',
        type: 'statement',
        label: 'Deferred liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 14,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 37,
        slug: 'otherCurrentLiabilities',
        type: 'statement',
        label: 'Other current liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 15,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 38,
        slug: 'totalCurrentLiabilities',
        type: 'statement',
        label: 'Total current liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 16,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 39,
        slug: 'longTermDebt',
        type: 'statement',
        label: 'Long-term debt',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 17,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 40,
        slug: 'deferredNonCurrentLiabilities',
        type: 'statement',
        label: 'Deferred liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 18,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 41,
        slug: 'otherNonCurrentLiabilities',
        type: 'statement',
        label: 'Other non-current liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 19,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 42,
        slug: 'totalNonCurrentLiabilities',
        type: 'statement',
        label: 'Total non-current liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 20,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 43,
        slug: 'totalLiabilities',
        type: 'statement',
        label: 'Total liabilities',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 21,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 44,
        slug: 'commonStock',
        type: 'statement',
        label: 'Common stock',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 22,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 45,
        slug: 'retainedEarnings',
        type: 'statement',
        label: 'Retained earnings',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 23,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 46,
        slug: 'comprehensiveIncome',
        type: 'statement',
        label: 'Comprehensive Income',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 24,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 47,
        slug: 'shareholderEquity',
        type: 'statement',
        label: 'Shareholder equity',
        statement: 'balance-sheet-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 25,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 48,
        slug: 'netIncome',
        type: 'statement',
        label: 'Net income',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 0,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 49,
        slug: 'depreciationAndAmortization',
        type: 'statement',
        label: 'Depreciation and amortization',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 1,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 50,
        slug: 'stockBasedCompensation',
        type: 'statement',
        label: 'Stock based compensation',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 2,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 51,
        slug: 'deferredIncomeTax',
        type: 'statement',
        label: 'Deferred income tax',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 3,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 52,
        slug: 'otherNonCashItems',
        type: 'statement',
        label: 'Other non-cash items',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 4,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 53,
        slug: 'changeInWorkingCapital',
        type: 'statement',
        label: 'Change in working capital',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 5,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 54,
        slug: 'operatingCashFlow',
        type: 'statement',
        label: 'Operating Cash Flow',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 6,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 55,
        slug: 'propertyPlantAndEquipmentInvestments',
        type: 'statement',
        label: 'Property, Plant and Equipment investments',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 7,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 56,
        slug: 'acquisitionsAndDisposals',
        type: 'statement',
        label: 'Acquisitions and disposals',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 8,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 57,
        slug: 'investmentPurchaseAndSale',
        type: 'statement',
        label: 'Investment purchase and sale',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 9,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 58,
        slug: 'otherInvestingActivities',
        type: 'statement',
        label: 'Other investing activities',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 10,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 59,
        slug: 'investingCashFlow',
        type: 'statement',
        label: 'Investing cash flow',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 11,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 60,
        slug: 'issuancePaymentsOfDebt',
        type: 'statement',
        label: 'Issuance payments of debt',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 12,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 61,
        slug: 'commonStockIssuance',
        type: 'statement',
        label: 'Common stock issuance',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 13,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 62,
        slug: 'dividendsPaid',
        type: 'statement',
        label: 'Dividends paid',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 14,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 63,
        slug: 'otherFinancialActivities',
        type: 'statement',
        label: 'Other financial activities',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 15,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 64,
        slug: 'financingCashFlow',
        type: 'statement',
        label: 'Financing cash flow',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 16,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 65,
        slug: 'beginningCashPosition',
        type: 'statement',
        label: 'Beginning cash position',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 17,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 66,
        slug: 'changesInCash',
        type: 'statement',
        label: 'Changes in cash',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 18,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 67,
        slug: 'endCashPosition',
        type: 'statement',
        label: 'End cash position',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 19,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 68,
        slug: 'capitalExpenditure',
        type: 'statement',
        label: 'Capital expenditure',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 20,
        is_main: false,
        direction: null,
        latex_description: null,
      },
      {
        id: 69,
        slug: 'freeCashFlow',
        type: 'statement',
        label: 'Free cash flow',
        statement: 'cash-flow-statement',
        unit: 'millions',
        unit_type: 'currency',
        index: 21,
        is_main: true,
        direction: null,
        latex_description: null,
      },
      {
        id: 78,
        slug: 'grossProfitMargin',
        type: 'ratio',
        label: 'Gross profit margin',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Gross Profit}{Revenue}',
      },
      {
        id: 70,
        slug: 'currentRatio',
        type: 'ratio',
        label: 'Current ratio',
        statement: 'liquidity-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'asc',
        latex_description:
          '\\dfrac{Total Current Assets}{Total Current Liabilities}',
      },
      {
        id: 71,
        slug: 'quickRatio',
        type: 'ratio',
        label: 'Quick ratio',
        statement: 'liquidity-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'asc',
        latex_description:
          '\\dfrac{Cash And Equivalents + Short Term Investments + Receivables}{Total Current Liabilities}',
      },
      {
        id: 72,
        slug: 'cashRatio',
        type: 'ratio',
        label: 'Cash ratio',
        statement: 'liquidity-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 2,
        is_main: false,
        direction: 'asc',
        latex_description:
          '\\dfrac{Cash And Equivalents}{Total Current Liabilities}',
      },
      {
        id: 73,
        slug: 'daysOfSalesOutstanding',
        type: 'ratio',
        label: 'Days of sales outstanding',
        statement: 'liquidity-ratios',
        unit: 'days',
        unit_type: 'ratio',
        index: 3,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Receivables}{Revenue/365}',
      },
      {
        id: 74,
        slug: 'daysOfInventoryOutstanding',
        type: 'ratio',
        label: 'Days of inventory outstanding',
        statement: 'liquidity-ratios',
        unit: 'days',
        unit_type: 'ratio',
        index: 4,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Inventory}{Cost Of Revenue/365}',
      },
      {
        id: 75,
        slug: 'daysOfPayablesOutstanding',
        type: 'ratio',
        label: 'Days of payables outstanding',
        statement: 'liquidity-ratios',
        unit: 'days',
        unit_type: 'ratio',
        index: 5,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Payables}{Cost Of Revenue/365}',
      },
      {
        id: 76,
        slug: 'operatingCycle',
        type: 'ratio',
        label: 'Operating cycle',
        statement: 'liquidity-ratios',
        unit: 'days',
        unit_type: 'ratio',
        index: 6,
        is_main: false,
        direction: 'desc',
        latex_description:
          '\\dfrac{Days Of Sales Outstanding + Days Of Inventory Outstanding}{}',
      },
      {
        id: 77,
        slug: 'cashConversionCycle',
        type: 'ratio',
        label: 'Cash conversion cycle',
        statement: 'liquidity-ratios',
        unit: 'days',
        unit_type: 'ratio',
        index: 7,
        is_main: false,
        direction: 'desc',
        latex_description:
          '\\dfrac{Days Of Sales Outstanding + Days Of Inventory Outstanding - Days Of Payables Outstanding}{}',
      },
      {
        id: 79,
        slug: 'operatingProfitMargin',
        type: 'ratio',
        label: 'Operating profit margin',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Operating Income}{Revenue}',
      },
      {
        id: 80,
        slug: 'pretaxProfitMargin',
        type: 'ratio',
        label: 'Pretax profit margin',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 2,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Income Before Tax}{Revenue}',
      },
      {
        id: 81,
        slug: 'netProfitMargin',
        type: 'ratio',
        label: 'Net profit margin',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 3,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Net Income}{Revenue}',
      },
      {
        id: 82,
        slug: 'effectiveTaxRate',
        type: 'ratio',
        label: 'Effective tax rate',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 4,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Income Tax}{Income Before Tax}',
      },
      {
        id: 83,
        slug: 'returnOnAssets',
        type: 'ratio',
        label: 'ROA',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 5,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Net Income}{Total Assets}',
      },
      {
        id: 84,
        slug: 'returnOnEquity',
        type: 'ratio',
        label: 'ROE',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 6,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Net Income}{Shareholder Equity}',
      },
      {
        id: 85,
        slug: 'returnOnCapitalEmployed',
        type: 'ratio',
        label: 'ROCE',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 7,
        is_main: false,
        direction: 'asc',
        latex_description:
          '\\dfrac{EBIT}{Total Assets-Total Current Liabilities}',
      },
      {
        id: 86,
        slug: 'ebitPerRevenue',
        type: 'ratio',
        label: 'EBIT / Revenue',
        statement: 'profitability-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 8,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{EBIT}{Revenue}',
      },
      {
        id: 87,
        slug: 'debtRatio',
        type: 'ratio',
        label: 'Debt ratio',
        statement: 'debt-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Total Liabilities}{Total Assets}',
      },
      {
        id: 88,
        slug: 'debtToEquity',
        type: 'ratio',
        label: 'Debt / Equity',
        statement: 'debt-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Total Liabilities}{Shareholder Equity}',
      },
      {
        id: 89,
        slug: 'debtToCapitalization',
        type: 'ratio',
        label: 'Debt / Capitalization',
        statement: 'debt-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 2,
        is_main: false,
        direction: 'desc',
        latex_description:
          '\\dfrac{Total Liabilities}{Total Liabilities+Shareholder Equity}',
      },
      {
        id: 90,
        slug: 'cashFlowToDebt',
        type: 'ratio',
        label: 'Cash flow / Debt',
        statement: 'debt-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 3,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Operating Cash Flow}{Total Liabilities}',
      },
      {
        id: 91,
        slug: 'equityMultiplier',
        type: 'ratio',
        label: 'Equity multiplier',
        statement: 'debt-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 4,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{Total Assets}{Shareholder Equity}',
      },
      {
        id: 92,
        slug: 'operatingCashFlowToSales',
        type: 'ratio',
        label: 'Operating cash flow / Sales',
        statement: 'cash-flow-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Operating Cash Flow}{Revenue}',
      },
      {
        id: 93,
        slug: 'freeCashFlowToOperatingCashFlow',
        type: 'ratio',
        label: 'Free cash flow / Operating cash flow',
        statement: 'cash-flow-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Free Cash Flow}{Operating Cash Flow}',
      },
      {
        id: 94,
        slug: 'cashFlowCoverage',
        type: 'ratio',
        label: 'Cash flow coverage',
        statement: 'cash-flow-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 2,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Operating Cash Flow}{Total Liabilities}',
      },
      {
        id: 95,
        slug: 'shortTermCashFlowCoverage',
        type: 'ratio',
        label: 'Short-term cash flow coverage',
        statement: 'cash-flow-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 3,
        is_main: false,
        direction: 'asc',
        latex_description:
          '\\dfrac{Operating Cash Flow}{Total Current Liabilities}',
      },
      {
        id: 96,
        slug: 'capitalExpenditureCoverage',
        type: 'ratio',
        label: 'Capital expenditure coverage',
        statement: 'cash-flow-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 4,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Operating Cash Flow}{Capital Expenditure}',
      },
      {
        id: 97,
        slug: 'fixedAssetTurnover',
        type: 'ratio',
        label: 'Fixed asset turnover',
        statement: 'operating-performance-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Revenue}{Property Plant And Equipment}',
      },
      {
        id: 98,
        slug: 'assetTurnover',
        type: 'ratio',
        label: 'Asset turnover',
        statement: 'operating-performance-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'asc',
        latex_description: '\\dfrac{Revenue}{Total Assets}',
      },
      {
        id: 99,
        slug: 'priceToBookValue',
        type: 'ratio',
        label: 'Price to book value',
        statement: 'valuation-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 0,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{StockPrice}{EquityPerShare}',
      },
      {
        id: 100,
        slug: 'priceToCashFlow',
        type: 'ratio',
        label: 'Price to cash flow',
        statement: 'valuation-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{StockPrice}{OperatingCashFlowPerShare}',
      },
      {
        id: 101,
        slug: 'priceToFreeCashFlow',
        type: 'ratio',
        label: 'Price to free cash flow',
        statement: 'valuation-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 1,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{StockPrice}{FreeCashFlowPerShare}',
      },
      {
        id: 102,
        slug: 'priceToEarnings',
        type: 'ratio',
        label: 'Price to earnings',
        statement: 'valuation-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 2,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{StockPrice}{EPS}',
      },
      {
        id: 103,
        slug: 'priceToSales',
        type: 'ratio',
        label: 'Price to sales',
        statement: 'valuation-ratios',
        unit: 'percent',
        unit_type: 'ratio',
        index: 3,
        is_main: false,
        direction: 'desc',
        latex_description: '\\dfrac{StockPrice}{RevenuePerShare}',
      },
    ])
    .into(TABLES.FINANCIAL_ITEMS)
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTableIfExists(TABLES.JOBS)
  await knex.schema.dropTableIfExists(TABLES.STD_LOGS)
  await knex.schema.dropTableIfExists(TABLES.FOREX)
  await knex.schema.dropTableIfExists(TABLES.USER_ACCOUNT_SECURITIES)
  await knex.schema.dropTableIfExists(TABLES.USER_ACCOUNTS)
  await knex.schema.dropTableIfExists(TABLES.USER_TRANSACTIONS)
  await knex.schema.dropTableIfExists(TABLES.FOLLOWED_SECURITIES)
  await knex.schema.dropTableIfExists(TABLES.FOLLOWED_SECURITY_GROUPS)
  await knex.schema.dropTableIfExists(TABLES.FINANCIALS)
  await knex.schema.dropTableIfExists(TABLES.FINANCIAL_ITEMS)
  await knex.schema.dropTableIfExists(TABLES.NEWS)
  await knex.schema.dropTableIfExists(TABLES.EARNINGS)
  await knex.schema.dropTableIfExists(TABLES.HISTORICAL_PRICES)
  await knex.schema.dropTableIfExists(TABLES.SECURITIES)
  await knex.schema.dropTableIfExists(TABLES.COMPANIES)
  await knex.schema.dropTableIfExists(TABLES.INDUSTRIES)
  await knex.schema.dropTableIfExists(TABLES.SECTORS)
  await knex.schema.dropTableIfExists(TABLES.USERS)
}
