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

    t.unique(['financial_item_id', 'security_id', 'period', 'year'])
    t.unique(['financial_item_id', 'sector_id', 'period', 'year'])
    t.index(['security_id', 'period'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(TABLES.FINANCIALS, (t) => {
    t.dropIndex(['security_id', 'period'])
    t.dropUnique(['financial_item_id', 'sector_id', 'period', 'year'])
    t.dropUnique(['financial_item_id', 'security_id', 'period', 'year'])

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
