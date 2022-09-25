package domain

type TTMOperation uint

const (
	TTMOperationSum TTMOperation = iota + 1
	TTMOperationLast
)

var FinancialTTMMap = map[string]TTMOperation{
	// Income statement
	"revenue":                          TTMOperationSum,
	"costOfRevenue":                    TTMOperationSum,
	"grossProfit":                      TTMOperationSum,
	"researchAndDevelopmentExpenses":   TTMOperationSum,
	"generalAndAdministrativeExpenses": TTMOperationSum,
	"otherExpenses":                    TTMOperationSum,
	"operatingExpenses":                TTMOperationSum,
	"costAndExpenses":                  TTMOperationSum,
	"operatingIncome":                  TTMOperationSum,
	"nonOperatingIncome":               TTMOperationSum,
	"incomeBeforeTax":                  TTMOperationSum,
	"incomeTaxExpense":                 TTMOperationSum,
	"netIncome":                        TTMOperationSum,
	"interestExpense":                  TTMOperationSum,
	"ebit":                             TTMOperationSum,
	"depreciationAndAmortization":      TTMOperationSum,
	"ebitda":                           TTMOperationSum,
	"sharesOutstanding":                TTMOperationLast,
	"sharesOutstandingDiluted":         TTMOperationLast,
	"eps":                              TTMOperationSum,
	"epsDiluted":                       TTMOperationSum,

	// Balance sheet
	"cashAndCashEquivalents":        TTMOperationLast,
	"shortTermInvestments":          TTMOperationLast,
	"receivables":                   TTMOperationLast,
	"inventory":                     TTMOperationLast,
	"otherCurrentAssets":            TTMOperationLast,
	"totalCurrentAssets":            TTMOperationLast,
	"propertyPlantAndEquipment":     TTMOperationLast,
	"goodwillAndIntangibleAssets":   TTMOperationLast,
	"longTermInvestments":           TTMOperationLast,
	"otherNonCurrentAssets":         TTMOperationLast,
	"totalNonCurrentAssets":         TTMOperationLast,
	"totalAssets":                   TTMOperationLast,
	"payables":                      TTMOperationLast,
	"shortTermDebt":                 TTMOperationLast,
	"deferredCurrentLiabilities":    TTMOperationLast,
	"otherCurrentLiabilities":       TTMOperationLast,
	"totalCurrentLiabilities":       TTMOperationLast,
	"longTermDebt":                  TTMOperationLast,
	"deferredNonCurrentLiabilities": TTMOperationLast,
	"otherNonCurrentLiabilities":    TTMOperationLast,
	"totalNonCurrentLiabilities":    TTMOperationLast,
	"totalLiabilities":              TTMOperationLast,
	"commonStock":                   TTMOperationLast,
	"retainedEarnings":              TTMOperationLast,
	"comprehensiveIncome":           TTMOperationLast,
	"shareholderEquity":             TTMOperationLast,

	// Cash flow statement
	"stockBasedCompensation":               TTMOperationSum,
	"deferredIncomeTax":                    TTMOperationSum,
	"otherNonCashItems":                    TTMOperationSum,
	"changeInWorkingCapital":               TTMOperationSum,
	"operatingCashFlow":                    TTMOperationSum,
	"propertyPlantAndEquipmentInvestments": TTMOperationSum,
	"acquisitionsAndDisposals":             TTMOperationSum,
	"investmentPurchaseAndSale":            TTMOperationSum,
	"otherInvestingActivities":             TTMOperationSum,
	"investingCashFlow":                    TTMOperationSum,
	"issuancePaymentsOfDebt":               TTMOperationSum,
	"commonStockIssuance":                  TTMOperationSum,
	"dividendsPaid":                        TTMOperationSum,
	"otherFinancialActivities":             TTMOperationSum,
	"financingCashFlow":                    TTMOperationSum,
	"beginningCashPosition":                TTMOperationSum,
	"changesInCash":                        TTMOperationSum,
	"endCashPosition":                      TTMOperationSum,
	"capitalExpenditure":                   TTMOperationSum,
	"freeCashFlow":                         TTMOperationSum,
}
