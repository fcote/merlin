package fmp

import (
	"fmt"
	"strconv"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

var PeriodMap = map[string]domain.FinancialPeriod{
	"FY": "Y",
	"Q1": "Q1",
	"Q2": "Q2",
	"Q3": "Q3",
	"Q4": "Q4",
}

func fromIncomeStatement(statement fmp.IncomeStatement, financialItemMap map[string]domain.FinancialItem) []domain.FinancialBase {
	financials := make([]domain.FinancialBase, 21)
	period := PeriodMap[statement.Period]
	reportDate := statement.Date
	year, _ := strconv.Atoi(statement.CalendarYear)

	getFinancialBase := func(
		slug string,
		value float64,
	) domain.FinancialBase {
		statement := domain.FinancialStatementIncome
		financialItemHash := fmt.Sprintf("%s-%s", statement, slug)
		financialItem := financialItemMap[financialItemHash]
		if financialItem.Unit == domain.FinancialUnitMillions {
			value /= 1e6
		}

		return domain.FinancialBase{
			Value:           value,
			Year:            year,
			Period:          period,
			ReportDate:      reportDate,
			IsEstimate:      false,
			FinancialItemId: financialItem.Id,
		}
	}

	financials[0] = getFinancialBase("revenue", statement.Revenue)
	financials[1] = getFinancialBase("costOfRevenue", statement.CostOfRevenue)
	financials[2] = getFinancialBase("grossProfit", statement.GrossProfit)
	financials[3] = getFinancialBase("researchAndDevelopmentExpenses", statement.ResearchAndDevelopmentExpenses)
	financials[4] = getFinancialBase("generalAndAdministrativeExpenses", statement.GeneralAndAdministrativeExpenses)
	financials[5] = getFinancialBase("otherExpenses", statement.OtherExpenses)
	financials[6] = getFinancialBase("operatingExpenses", statement.OperatingExpenses)
	financials[7] = getFinancialBase("costAndExpenses", statement.CostAndExpenses)
	financials[8] = getFinancialBase("operatingIncome", statement.OperatingIncome)
	financials[9] = getFinancialBase("nonOperatingIncome", statement.TotalOtherIncomeExpensesNet)
	financials[10] = getFinancialBase("incomeBeforeTax", statement.IncomeBeforeTax)
	financials[11] = getFinancialBase("incomeTaxExpense", statement.IncomeTaxExpense)
	financials[12] = getFinancialBase("netIncome", statement.NetIncome)
	financials[13] = getFinancialBase("interestExpense", statement.InterestExpense)
	financials[14] = getFinancialBase("ebit", statement.NetIncome+statement.InterestExpense+statement.IncomeTaxExpense)
	financials[15] = getFinancialBase("depreciationAndAmortization", statement.DepreciationAndAmortization)
	financials[16] = getFinancialBase("ebitda", statement.Ebitda)
	financials[17] = getFinancialBase("sharesOutstanding", statement.WeightedAverageShsOut)
	financials[18] = getFinancialBase("sharesOutstandingDiluted", statement.WeightedAverageShsOutDil)
	financials[19] = getFinancialBase("eps", statement.Eps)
	financials[20] = getFinancialBase("epsDiluted", statement.EpsDiluted)

	return financials
}

func fromBalanceSheetStatement(statement fmp.BalanceSheetStatement, financialItemMap map[string]domain.FinancialItem) []domain.FinancialBase {
	financials := make([]domain.FinancialBase, 26)
	period := PeriodMap[statement.Period]
	reportDate := statement.Date
	year, _ := strconv.Atoi(statement.CalendarYear)

	getFinancialBase := func(
		slug string,
		value float64,
	) domain.FinancialBase {
		statement := domain.FinancialStatementBalanceSheet
		financialItemHash := fmt.Sprintf("%s-%s", statement, slug)
		financialItem := financialItemMap[financialItemHash]
		if financialItem.Unit == domain.FinancialUnitMillions {
			value /= 1e6
		}

		return domain.FinancialBase{
			Value:           value,
			Year:            year,
			Period:          period,
			ReportDate:      reportDate,
			IsEstimate:      false,
			FinancialItemId: financialItem.Id,
		}
	}

	financials[0] = getFinancialBase("cashAndCashEquivalents", statement.CashAndCashEquivalents)
	financials[1] = getFinancialBase("shortTermInvestments", statement.ShortTermInvestments)
	financials[2] = getFinancialBase("receivables", statement.NetReceivables)
	financials[3] = getFinancialBase("inventory", statement.Inventory)
	financials[4] = getFinancialBase("otherCurrentAssets", statement.OtherCurrentAssets)
	financials[5] = getFinancialBase("totalCurrentAssets", statement.TotalCurrentAssets)
	financials[6] = getFinancialBase("propertyPlantAndEquipment", statement.PropertyPlantEquipmentNet)
	financials[7] = getFinancialBase("goodwillAndIntangibleAssets", statement.GoodwillAndIntangibleAssets)
	financials[8] = getFinancialBase("longTermInvestments", statement.LongTermInvestments)
	financials[9] = getFinancialBase("otherNonCurrentAssets", statement.OtherNonCurrentAssets)
	financials[10] = getFinancialBase("totalNonCurrentAssets", statement.TotalNonCurrentAssets)
	financials[11] = getFinancialBase("totalAssets", statement.TotalAssets)
	financials[12] = getFinancialBase("payables", statement.AccountPayables)
	financials[13] = getFinancialBase("shortTermDebt", statement.ShortTermDebt)
	financials[14] = getFinancialBase("deferredCurrentLiabilities", statement.DeferredRevenue)
	financials[15] = getFinancialBase("otherCurrentLiabilities", statement.OtherCurrentLiabilities)
	financials[16] = getFinancialBase("totalCurrentLiabilities", statement.TotalCurrentLiabilities)
	financials[17] = getFinancialBase("longTermDebt", statement.LongTermDebt)
	financials[18] = getFinancialBase("deferredNonCurrentLiabilities", statement.DeferredRevenueNonCurrent+statement.DeferredTaxLiabilitiesNonCurrent)
	financials[19] = getFinancialBase("otherNonCurrentLiabilities", statement.OtherNonCurrentLiabilities)
	financials[20] = getFinancialBase("totalNonCurrentLiabilities", statement.TotalNonCurrentLiabilities)
	financials[21] = getFinancialBase("totalLiabilities", statement.TotalLiabilities)
	financials[22] = getFinancialBase("commonStock", statement.CommonStock)
	financials[23] = getFinancialBase("retainedEarnings", statement.RetainedEarnings)
	financials[24] = getFinancialBase("comprehensiveIncome", statement.AccumulatedOtherComprehensiveIncomeLoss)
	financials[25] = getFinancialBase("shareholderEquity", statement.TotalStockholdersEquity)

	return financials
}

func fromCashFlowStatement(statement fmp.CashFlowStatement, financialItemMap map[string]domain.FinancialItem) []domain.FinancialBase {
	financials := make([]domain.FinancialBase, 22)
	period := PeriodMap[statement.Period]
	reportDate := statement.Date
	year, _ := strconv.Atoi(statement.CalendarYear)

	getFinancialBase := func(
		slug string,
		value float64,
	) domain.FinancialBase {
		statement := domain.FinancialStatementCashFlow
		financialItemHash := fmt.Sprintf("%s-%s", statement, slug)
		financialItem := financialItemMap[financialItemHash]
		if financialItem.Unit == domain.FinancialUnitMillions {
			value /= 1e6
		}

		return domain.FinancialBase{
			Value:           value,
			Year:            year,
			Period:          period,
			ReportDate:      reportDate,
			IsEstimate:      false,
			FinancialItemId: financialItem.Id,
		}
	}

	financials[0] = getFinancialBase("netIncome", statement.NetIncome)
	financials[1] = getFinancialBase("depreciationAndAmortization", statement.DepreciationAndAmortization)
	financials[2] = getFinancialBase("stockBasedCompensation", statement.StockBasedCompensation)
	financials[3] = getFinancialBase("deferredIncomeTax", statement.DeferredIncomeTax)
	financials[4] = getFinancialBase("otherNonCashItems", statement.OtherNonCashItems)
	financials[5] = getFinancialBase("changeInWorkingCapital", statement.ChangeInWorkingCapital)
	financials[6] = getFinancialBase("operatingCashFlow", statement.NetCashProvidedByOperatingActivities)
	financials[7] = getFinancialBase("propertyPlantAndEquipmentInvestments", statement.InvestmentsInPropertyPlantAndEquipment)
	financials[8] = getFinancialBase("acquisitionsAndDisposals", statement.AcquisitionsNet)
	financials[9] = getFinancialBase("investmentPurchaseAndSale", statement.PurchasesOfInvestments+statement.SalesMaturitiesOfInvestments)
	financials[10] = getFinancialBase("otherInvestingActivities", statement.OtherInvestingActivites)
	financials[11] = getFinancialBase("investingCashFlow", statement.NetCashUsedForInvestingActivites)
	financials[12] = getFinancialBase("issuancePaymentsOfDebt", 0)
	financials[13] = getFinancialBase("commonStockIssuance", statement.CommonStockIssued+statement.CommonStockRepurchased)
	financials[14] = getFinancialBase("dividendsPaid", statement.DividendsPaid)
	financials[15] = getFinancialBase("otherFinancialActivities", statement.OtherFinancingActivites)
	financials[16] = getFinancialBase("financingCashFlow", statement.NetCashUsedProvidedByFinancingActivities)
	financials[17] = getFinancialBase("beginningCashPosition", statement.CashAtBeginningOfPeriod)
	financials[18] = getFinancialBase("changesInCash", statement.NetChangeInCash)
	financials[19] = getFinancialBase("endCashPosition", statement.CashAtEndOfPeriod)
	financials[20] = getFinancialBase("capitalExpenditure", statement.CapitalExpenditure)
	financials[21] = getFinancialBase("freeCashFlow", statement.FreeCashFlow)

	return financials
}
