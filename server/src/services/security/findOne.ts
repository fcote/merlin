import { SecurityFilters } from '@resolvers/security/security.inputs'
import { SecurityService } from '@services/security/index'
import { ServiceMethod } from '@services/service'

class SecurityFindOneMethod extends ServiceMethod {
  protected service: SecurityService

  run = async (filters: SecurityFilters) => {
    const response = await this.service.find(filters)
    return response.nodes.shift()
  }
}

export { SecurityFindOneMethod }
