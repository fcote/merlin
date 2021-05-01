export default interface UserIncome {
  incomePerYear?: number
  incomePerMonthBeforeTaxes?: number
  netIncomePerMonth?: number
  incomeTaxRate?: number
  salaryChargeRate?: number
}

export enum UserIncomeItemLabel {
  incomePerYear = 'Gross salary per year',
  incomePerMonthBeforeTaxes = 'Income before tax',
  netIncomePerMonth = 'Net income',
  incomeTaxRate = 'Income tax rate',
  salaryChargeRate = 'Wage charges',
}

export enum UserIncomeType {
  amount = 'amount',
  ratio = 'ratio',
}

export enum UserIncomeItemType {
  incomePerYear = 'amount',
  incomePerMonthBeforeTaxes = 'amount',
  netIncomePerMonth = 'amount',
  incomeTaxRate = 'ratio',
  salaryChargeRate = 'ratio',
}
