import stringHash from '@sindresorhus/string-hash'
import { GraphQLDateTime } from 'graphql-scalars'
import { without, get } from 'lodash'
import {
  Model,
  ModelOptions,
  Pojo,
  QueryBuilder,
  Transaction,
  raw,
} from 'objection'
import { ObjectType, Field, ID } from 'type-graphql'

import { camelToSnakeCase } from '@helpers/camelToSnakeCase'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { ApolloUnprocessableEntity } from '@typings/errors/apolloErrors'
import { BadRequest } from '@typings/errors/errors'

@ObjectType('BaseModel', { isAbstract: true })
class BaseModel extends Model {
  @Field((_) => ID)
  id: number | string
  @Field((_) => GraphQLDateTime)
  createdAt: Date

  // Required to resolve circular dependencies of relationMappings
  static get modelPaths() {
    return [__dirname]
  }

  // Convenience methods

  static async findByIds<M extends typeof BaseModel>(
    this: M,
    ids: readonly (number | string)[],
    withArchived: boolean = false,
    trx?: Transaction
  ): Promise<(InstanceType<M> | undefined)[]> {
    return this.findBy('id', ids, withArchived, trx)
  }

  static async findBy<M extends typeof BaseModel>(
    this: M,
    key: string,
    values: readonly any[],
    withArchived: boolean = false,
    trx?: Transaction
  ): Promise<(InstanceType<M> | undefined)[]> {
    const rows = (await this.query(trx)
      .context({ withArchived })
      .select('*')
      .whereIn(key, values as any[])) as InstanceType<M>[]

    // Reorder rows is required by the Dataloader
    return values.map((val) =>
      rows.find((row) => String(get(row, key)) === String(val))
    )
  }

  // Advisory Lock

  static async acquireLock(slug: string, trx: Transaction, timeoutMs?: number) {
    const selectLock = trx.raw('pg_advisory_xact_lock(?) as lock', [
      stringHash(slug),
    ])

    if (timeoutMs) {
      await trx.raw('set local lock_timeout = ??', [timeoutMs])
    }
    await trx.queryBuilder().select(selectLock)
  }

  // Relations handling

  static async paginate<M extends typeof BaseModel>(
    this: M,
    query: QueryBuilder<InstanceType<M>>,
    paginate?: PaginationOptions | undefined,
    orderBy?: OrderOptions[] | undefined
  ): Promise<Paginated<InstanceType<M>>> {
    if (orderBy) {
      orderBy.forEach((o) => query.orderBy(o.field, o.direction ?? 'asc'))
    }

    if (paginate?.offset) {
      query.offset(paginate.offset)
    }
    if (paginate?.limit && paginate?.limit >= 0) {
      query.limit(paginate.limit)
    }

    const [total, nodes] = await Promise.all([query.resultSize(), query])

    return { nodes, total }
  }

  static async paginateRelation<M extends typeof BaseModel>(
    this: M,
    query: QueryBuilder<InstanceType<M>>,
    groupBy: string,
    keys: readonly (string | number)[],
    paginate?: PaginationOptions,
    orderBy?: OrderOptions[]
  ): Promise<Paginated<InstanceType<M>>[]> {
    keys = keys.map((k) => k.toString())
    const idColumn = `${this.tableName}.id`
    const groupColumn = `${this.tableName}.${camelToSnakeCase(groupBy)}`

    query.whereIn(groupColumn, keys as (string | number)[])

    // Count query by group key
    const countQuery = this.query()
      .context({ withArchived: true })
      .with(this.tableName, query.clone())
      .select(groupColumn)
      .count(idColumn)
      .groupBy(groupColumn)

    const offset = paginate?.offset ?? 0
    const limit =
      paginate?.limit && paginate?.limit >= 0 ? paginate?.limit : null
    const orders = orderBy?.map((o) => `${this.tableName}.${o.field}`) ?? [
      idColumn,
    ]
    const ordersBindings =
      orderBy?.map(({ direction }) => `?? ${direction ?? 'asc'}`)?.join(', ') ??
      '?? asc'

    // Rank children
    const ranked = this.query(query.context().transaction)
      .select(
        idColumn,
        groupColumn,
        raw(
          `row_number() over (partition by ?? order by ${ordersBindings}) as rank`,
          [groupColumn, ...orders]
        )
      )
      .as('ranked')

    // Paginate children
    query.innerJoin(ranked, (q) => {
      q.andOn(idColumn, '=', 'ranked.id')
      // @ts-ignore
      q.andOn('ranked.rank', '>', offset)
      if (limit) {
        // @ts-ignore
        q.andOn('ranked.rank', '<=', offset + limit)
      }
    })

    const flatNodes = await query
    const totals = (await countQuery) as unknown as { count: number }[]

    return keys.map((k) => {
      const total =
        totals.find((t) => get(t, groupBy).toString() === k)?.count ?? 0
      const nodes =
        flatNodes.filter((n) => get(n, groupBy).toString() === k) ?? []
      return {
        total: Number(total),
        nodes,
      }
    })
  }

  // Validation

  /**
   * Database validation rules executor
   *
   * @param databaseRules
   * @returns
   * @memberOf BaseModel
   */
  protected async validate(databaseRules: Promise<string | undefined>[]) {
    const validations = without(await Promise.all(databaseRules), undefined)
    const errors = validations.join(', ')
    if (validations.length) {
      throw new ApolloUnprocessableEntity(errors)
    }
  }

  /**
   * Input validation override
   *
   * @param json
   * @param opt
   * @returns
   * @memberOf BaseModel
   */
  $validate(json: Pojo, opt: ModelOptions): Pojo {
    try {
      return super.$validate(json, opt)
    } catch (e: any) {
      // Throw an apollo error instead of the objection one
      const error = new BadRequest(e.message, { data: e.data })
      error.stack = e.stack
      throw error
    }
  }
}

export { BaseModel }
