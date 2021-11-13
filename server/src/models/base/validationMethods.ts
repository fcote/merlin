import { get } from 'lodash'
import { Transaction } from 'objection'

import { BaseModel } from '@models/base'
import { ALREADY_EXISTS } from '@typings/messages'

const unique = async <T extends BaseModel>(
  target: T,
  keys: string[],
  trx?: Transaction
) => {
  const query = (target as any).constructor.query(trx).select('id')

  keys.forEach((k) => {
    if (!get(target, k)) return

    query.where(k, get(target, k))
  })

  const row = await query.first()

  if (row?.id) {
    return ALREADY_EXISTS(`${keys}`)
  }
}

export { unique }
