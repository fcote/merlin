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
