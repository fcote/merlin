import { CompanySyncFields } from '@resolvers/company/company.inputs'
import { CompanySyncMethod } from '@services/company/sync'
import { Service } from '@services/service'

class CompanyService extends Service {
  sync = async (inputs: CompanySyncFields) =>
    new CompanySyncMethod(this).run(inputs)
}

export { CompanyService }
