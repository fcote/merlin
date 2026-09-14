class EarningCallTranscriptFields {
  ticker: string

  fiscalQuarter: number

  fiscalYear: number
}

class EarningFilters {
  ticker?: string

  fromDate?: Date

  toDate?: Date

  userId?: string
}

export { EarningFilters, EarningCallTranscriptFields }
