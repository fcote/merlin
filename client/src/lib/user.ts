export default interface User {
  id: string
  username: string
  apiToken: string
  currency: string
  incomePerYear: number
  incomeTaxRate: number
  incomePerMonthBeforeTaxes: number
  salaryChargeRate: number
  accountTotalBalance: number
  netIncomePerMonth: number
}
