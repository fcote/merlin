import { Knex } from 'knex'

const TABLES = {
  FINANCIALS: 'financials',
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(TABLES.FINANCIALS, (t) => {
    t.dropUnique([
      'security_id',
      'financial_item_id',
      'sector_id',
      'year',
      'period',
    ])

    t.boolean('is_estimate').notNullable().defaultTo(false)

    t.unique([
      'security_id',
      'sector_id',
      'financial_item_id',
      'period',
      'year',
    ])
    t.index(['security_id', 'financial_item_id', 'period', 'is_estimate'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(TABLES.FINANCIALS, (t) => {
    t.dropIndex(['security_id', 'financial_item_id', 'period', 'is_estimate'])
    t.dropUnique([
      'security_id',
      'sector_id',
      'financial_item_id',
      'period',
      'year',
    ])

    t.dropColumn('is_estimate')

    t.unique([
      'security_id',
      'financial_item_id',
      'sector_id',
      'year',
      'period',
    ])
  })
}
