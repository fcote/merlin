import { pickBy } from 'lodash'
import { PartialModelGraph } from 'objection'

import { companyOverviewLink } from '@links/links'
import { SecurityCompanyOverviewResult } from '@links/types'
import { Company } from '@models/company'
import { Industry } from '@models/industry'
import { Sector } from '@models/sector'
import { CompanySyncFields } from '@resolvers/company/company.inputs'
import { ServiceMethod } from '@services/service'
import { ApolloBadRequest } from '@typings/errors/apolloErrors'

class CompanySyncMethod extends ServiceMethod {
  run = async (inputs: CompanySyncFields): Promise<Company> => {
    if (!inputs.ticker && !inputs.overview) {
      throw new ApolloBadRequest('COMPANY_SYNC_MISSING_TICKER_OR_OVERVIEW')
    }

    const rawCompanyOverview =
      inputs.overview ??
      (await companyOverviewLink.companyOverview(inputs.ticker))
    if (!rawCompanyOverview) return null

    const company = await Company.query(this.trx).findOne({
      name: rawCompanyOverview.name,
    })

    const companyOverview: Partial<SecurityCompanyOverviewResult> = pickBy(
      rawCompanyOverview,
      (value) => value
    )
    const sector = await this.getSector(companyOverview)
    const industry = await this.getIndustry(companyOverview)

    const companyInputs: PartialModelGraph<Company> = {
      cik: companyOverview.cik,
      isin: companyOverview.isin,
      cusip: companyOverview.cusip,
      name: companyOverview.name,
      description: companyOverview.description,
      sectorId: sector?.id,
      industryId: industry?.id,
      address: companyOverview.address,
      employees: companyOverview.employees,
    }

    return Company.query(this.trx).upsertGraphAndFetch({
      ...(company?.id && { id: company.id }),
      ...companyInputs,
    })
  }

  private getSector = async (
    companyOverview: Partial<SecurityCompanyOverviewResult>
  ): Promise<Sector> => {
    if (!companyOverview.sector) return

    const sector = await Sector.query(this.trx).findOne({
      name: companyOverview.sector,
    })
    if (sector) return sector

    await Sector.acquireLock(`sector.${companyOverview.sector}`, this.trx)
    return Sector.query(this.trx)
      .insert({ name: companyOverview.sector })
      .returning('*')
  }

  private getIndustry = async (
    companyOverview: Partial<SecurityCompanyOverviewResult>
  ): Promise<Industry> => {
    if (!companyOverview.industry) return

    const industry = await Industry.query(this.trx).findOne({
      name: companyOverview.industry,
    })
    if (industry) return industry

    await Industry.acquireLock(`industry.${companyOverview.industry}`, this.trx)
    return Industry.query(this.trx)
      .insert({ name: companyOverview.industry })
      .returning('*')
  }
}

export { CompanySyncMethod }
