import { Color } from '@style/color'

import { FinancialItem } from '@lib/financialItem'

export enum FinancialFreq {
  Y = 'Y',
  Q = 'Q',
  TTM = 'TTM',
}

export enum FinancialPeriod {
  Y = 'Y',
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum FinancialPerformanceGrade {
  aPlus = 'A+',
  a = 'A',
  aMinus = 'A-',
  bPlus = 'B+',
  b = 'B',
  bMinus = 'B-',
  cPlus = 'C+',
  c = 'C',
  cMinus = 'C-',
}

export const FinancialPerformanceGradeBackgroundColor = {
  aPlus: Color.success,
  a: Color.success,
  aMinus: Color.success,
  bPlus: Color.warning,
  b: Color.warning,
  bMinus: Color.warning,
  cPlus: Color.error,
  c: Color.error,
  cMinus: Color.error,
}

export type FinancialPerformance = {
  grade: keyof typeof FinancialPerformanceGrade
  sectorValue: number
  diffPercent: number
}

export type Financial = {
  id: string
  value: number
  year: number
  period: FinancialPeriod
  reportDate: string

  performance: FinancialPerformance

  securityId?: string
  financialItemId?: string

  financialItem: FinancialItem
}
