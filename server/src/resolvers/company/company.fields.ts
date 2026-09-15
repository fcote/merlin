import { Company } from '@models/company'
import { RequestContext } from '@typings/context'

class CompanyFieldsResolver {
  async sector(company: Company, ctx: RequestContext) {
    if (!company.sectorId) return
    const sector = await ctx.loaders!.companySector.load(company.sectorId)
    return sector?.name
  }

  async industry(company: Company, ctx: RequestContext) {
    if (!company.industryId) return
    const industry = await ctx.loaders!.companyIndustry.load(company.industryId)
    return industry?.name
  }
}

export { CompanyFieldsResolver }
