import { dayjs } from '@helpers/dayjs'

const fiscalPeriodFromDate = (date: string, fiscalYearEndMonth?: number) => {
  if (!fiscalYearEndMonth) {
    return { fiscalYear: null, fiscalQuarter: null }
  }

  const fiscalQuarterOffset = (12 - fiscalYearEndMonth) / 3
  const fiscalDate = dayjs(date).add(fiscalQuarterOffset, 'quarter')
  const fiscalYear = fiscalDate.isValid() ? fiscalDate.year() : dayjs().year()
  const quarter = fiscalDate.quarter()
  return { fiscalYear, fiscalQuarter: quarter }
}

export { fiscalPeriodFromDate }
