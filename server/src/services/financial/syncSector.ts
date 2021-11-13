import { groupBy } from 'lodash'
import pmap from 'p-map'

import { median } from '@helpers/median'
import { Financial } from '@models/financial'
import { FinancialItem, FinancialItemType } from '@models/financialItem'
import { Sector } from '@models/sector'
import { FinancialSyncSectorFields } from '@resolvers/financial/financial.inputs'
import { ServiceMethod } from '@services/service'

class FinancialSyncSectorMethod extends ServiceMethod {
  private sector: Sector
  private sectorFinancials: Financial[]
  private currentSectorFinancials: Financial[]
  private ratioFinancialItems: FinancialItem[]

  run = async (inputs: FinancialSyncSectorFields) => {
    const sector = await Sector.query(this.trx).findOne({ name: inputs.name })
    if (!sector) return

    this.sector = sector
    this.ratioFinancialItems = await FinancialItem.query(this.trx).where({
      type: FinancialItemType.ratio,
    })

    await pmap(
      inputs.periods,
      async ({ year, period }) => {
        this.currentSectorFinancials = await Financial.query(this.trx)
          .joinRelated('financialItem')
          .where('financialItem.type', FinancialItemType.ratio)
          .where('financials.sectorId', this.sector.id)
          .where('financials.year', year)
          .where('financials.period', period)
          .where('financials.isEstimate', false)
        this.sectorFinancials = await Financial.query(this.trx)
          .joinRelated('[security.company, financialItem]')
          .where('security:company.sectorId', this.sector.id)
          .where('financialItem.type', FinancialItemType.ratio)
          .where('financials.year', year)
          .where('financials.period', period)
          .where('financials.isEstimate', false)
          .whereNull('financials.sectorId')

        const financialInputs = this.getSectorAveragesFinancialsInputs()
        await Financial.query(this.trx).upsertGraph(financialInputs, {
          relate: true,
          noDelete: true,
        })
      },
      { concurrency: 1 }
    )
  }

  private getSectorAveragesFinancialsInputs = (): Partial<Financial>[] => {
    const sectorFinancialPeriods = groupBy(
      this.sectorFinancials,
      (f) => f.financialItemId
    )

    return Object.values(sectorFinancialPeriods).map((periodFinancials) => {
      const [baseFinancial] = periodFinancials
      const financialItem = this.ratioFinancialItems.find(
        (fi) => fi.id === baseFinancial.financialItemId
      )
      const existingFinancial = this.currentSectorFinancials.find(
        (f) => f.financialItemId === financialItem?.id
      )
      return {
        ...(existingFinancial && { id: existingFinancial.id }),
        period: baseFinancial.period,
        year: baseFinancial.year,
        reportDate: baseFinancial.reportDate,
        value: median(
          periodFinancials.map((f) => f.value ?? 0).filter((v) => v >= 0)
        ),
        financialItemId: financialItem?.id,
        sectorId: this.sector.id,
      }
    })
  }
}

export { FinancialSyncSectorMethod }
