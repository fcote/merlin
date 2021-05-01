import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql'

import { Company } from '@models/company'
import { RequestContext } from '@typings/context'

@Resolver(Company)
class CompanyFieldsResolver {
  @FieldResolver((_) => String, { nullable: true })
  async sector(
    @Root() company: Company,
    @Ctx() ctx: RequestContext
  ): Promise<string> {
    const sector =
      company.sectorId &&
      (await ctx.loaders.companySector.load(company.sectorId))
    return sector?.name
  }

  @FieldResolver((_) => String, { nullable: true })
  async industry(
    @Root() company: Company,
    @Ctx() ctx: RequestContext
  ): Promise<string> {
    const industry =
      company.industryId &&
      (await ctx.loaders.companyIndustry.load(company.industryId))
    return industry?.name
  }
}

export { CompanyFieldsResolver }
