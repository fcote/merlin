import { StdLog } from '@models/stdLog'
import {
  PaginationOptions,
  OrderOptions,
  Paginated,
} from '@resolvers/paginated'
import { ServiceMethod } from '@services/service'

class StdLogFindMethod extends ServiceMethod {
  run = async (
    paginate: PaginationOptions,
    orderBy: OrderOptions[]
  ): Promise<Paginated<StdLog>> => {
    return StdLog.paginate(StdLog.query(this.trx), paginate, orderBy)
  }
}

export { StdLogFindMethod }
