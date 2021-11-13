import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Company } from '@models/company'
import { RequestContext } from '@typings/context'

@Resolver(Company)
class CompanyFieldsResolver {
  @FieldResolver((_) => String, { nullable: true })
  async sector(@Root() company: Company, @Ctx() ctx: RequestContext) {
    if (!company.sectorId) return
    const sector = await ctx.loaders!.companySector.load(company.sectorId)
    return sector?.name
  }

  @FieldResolver((_) => String, { nullable: true })
  async industry(@Root() company: Company, @Ctx() ctx: RequestContext) {
    if (!company.industryId) return
    const industry = await ctx.loaders!.companyIndustry.load(company.industryId)
    return industry?.name
  }
}

export { CompanyFieldsResolver }
