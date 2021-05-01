import { PaginationOptions, OrderOptions } from '@resolvers/paginated'
import { Service } from '@services/service'
import { StdLogFindMethod } from '@services/stdLog/find'

class StdLogService extends Service {
  find = async (pagination: PaginationOptions, orderBy: OrderOptions[]) =>
    new StdLogFindMethod(this).run(pagination, orderBy)
}

export { StdLogService }
