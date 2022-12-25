package usecase

import (
	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const (
	daysInYear    = 365
	daysInQuarter = 92
)

type financialRatioPeriodProcessor struct {
	year             int
	period           domain.FinancialPeriod
	financials       financialByItem
	financialItemMap map[string]domain.FinancialItem

	reportDate string
	days       float64
	price      float64
	securityId *int
	sectorId   *int
}

func newFinancialRatioPeriodProcessor(
	year int,
	period domain.FinancialPeriod,
	prices domain.HistoricalPrices,
	financials financialByItem,
	financialItemMap map[string]domain.FinancialItem,
) financialRatioPeriodProcessor {
	var reportDate string
	var securityId *int
	var sectorId *int
	for _, financial := range financials {
		reportDate = financial.ReportDate
		securityId = financial.SecurityId
		sectorId = financial.SectorId
		break
	}

	var days int
	if period.IsQuarter() {
		days = daysInQuarter
	} else {
		days = daysInYear
	}

	var price float64
	if period == domain.FinancialPeriodTTM {
		price = prices.LastPrice()
	} else {
		price = prices.MeanPriceForDate(reportDate)
	}

	return financialRatioPeriodProcessor{
		year:             year,
		period:           period,
		price:            price,
		financials:       financials,
		financialItemMap: financialItemMap,

		days:       float64(days),
		reportDate: reportDate,
		securityId: securityId,
		sectorId:   sectorId,
	}
}

func (p financialRatioPeriodProcessor) processPeriod() domain.Financials {
	ratioFinancials := make(domain.Financials, 34)

	ratioFinancials[0] = p.format("currentRatio", p.ratio(
		[]string{"totalCurrentAssets"},
		[]string{"totalCurrentLiabilities"},
	))
	ratioFinancials[1] = p.format("quickRatio", p.ratio(
		[]string{"cashAndCashEquivalents", "shortTermInvestments", "receivables"},
		[]string{"totalCurrentLiabilities"},
	))
	ratioFinancials[2] = p.format("cashRatio", p.ratio(
		[]string{"cashAndCashEquivalents"},
		[]string{"totalCurrentLiabilities"},
	))
	ratioFinancials[3] = p.format("daysOfSalesOutstanding", math.Divide(
		p.value("receivables"),
		math.Divide(p.value("revenue"), p.days),
	))
	ratioFinancials[4] = p.format("daysOfInventoryOutstanding", math.Divide(
		p.value("inventory"),
		math.Divide(p.value("costOfRevenue"), p.days),
	))
	ratioFinancials[5] = p.format("daysOfPayablesOutstanding", math.Divide(
		p.value("payables"),
		math.Divide(p.value("costOfRevenue"), p.days),
	))
	ratioFinancials[6] = p.format("operatingCycle", math.Sum(
		ratioFinancials[3].Value,
		ratioFinancials[4].Value,
	))
	ratioFinancials[7] = p.format("cashConversionCycle",
		math.Sum(ratioFinancials[3].Value, ratioFinancials[4].Value)-ratioFinancials[5].Value,
	)

	// Profitability
	ratioFinancials[8] = p.format("grossProfitMargin", p.ratio(
		[]string{"grossProfit"},
		[]string{"revenue"},
	))
	ratioFinancials[9] = p.format("operatingProfitMargin", p.ratio(
		[]string{"operatingIncome"},
		[]string{"revenue"},
	))
	ratioFinancials[10] = p.format("pretaxProfitMargin", p.ratio(
		[]string{"incomeBeforeTax"},
		[]string{"revenue"},
	))
	ratioFinancials[11] = p.format("netProfitMargin", p.ratio(
		[]string{"netIncome"},
		[]string{"revenue"},
	))
	ratioFinancials[12] = p.format("effectiveTaxRate", p.ratio(
		[]string{"incomeTaxExpense"},
		[]string{"incomeBeforeTax"},
	))
	ratioFinancials[13] = p.format("returnOnAssets", p.ratio(
		[]string{"netIncome"},
		[]string{"totalAssets"},
	))
	ratioFinancials[14] = p.format("returnOnEquity", p.ratio(
		[]string{"netIncome"},
		[]string{"shareholderEquity"},
	))
	ratioFinancials[15] = p.format("returnOnCapitalEmployed", math.Divide(
		p.value("ebit"),
		p.value("totalAssets")-p.value("totalCurrentLiabilities"),
	))
	ratioFinancials[16] = p.format("ebitPerRevenue", p.ratio([]string{"ebit"}, []string{"revenue"}))

	// Debt
	ratioFinancials[17] = p.format("debtRatio", p.ratio(
		[]string{"totalLiabilities"},
		[]string{"totalAssets"},
	))
	ratioFinancials[18] = p.format("debtToEquity", p.ratio(
		[]string{"totalLiabilities"},
		[]string{"shareholderEquity"},
	))
	ratioFinancials[19] = p.format("debtToCapitalization", p.ratio(
		[]string{"totalLiabilities"},
		[]string{"totalLiabilities", "shareholderEquity"},
	))
	ratioFinancials[20] = p.format("cashFlowToDebt", p.ratio(
		[]string{"operatingCashFlow"},
		[]string{"totalLiabilities"},
	))
	ratioFinancials[21] = p.format("equityMultiplier", p.ratio(
		[]string{"totalAssets"},
		[]string{"shareholderEquity"},
	))

	// Operating performance
	ratioFinancials[22] = p.format("fixedAssetTurnover", p.ratio(
		[]string{"revenue"},
		[]string{"propertyPlantAndEquipment"},
	))
	ratioFinancials[23] = p.format("assetTurnover", p.ratio(
		[]string{"revenue"},
		[]string{"totalAssets"},
	))

	// Cash flow
	ratioFinancials[24] = p.format("operatingCashFlowToSales", p.ratio(
		[]string{"operatingCashFlow"},
		[]string{"revenue"},
	))
	ratioFinancials[25] = p.format("freeCashFlowToOperatingCashFlow", p.ratio(
		[]string{"freeCashFlow"},
		[]string{"operatingCashFlow"},
	))
	ratioFinancials[26] = p.format("cashFlowCoverage", p.ratio(
		[]string{"operatingCashFlow"},
		[]string{"totalLiabilities"},
	))
	ratioFinancials[27] = p.format("shortTermCashFlowCoverage", p.ratio(
		[]string{"operatingCashFlow"},
		[]string{"totalCurrentLiabilities"},
	))
	ratioFinancials[28] = p.format("capitalExpenditureCoverage", math.Divide(
		p.value("operatingCashFlow"),
		-p.value("capitalExpenditure"),
	))

	ratioFinancials[29] = p.format("priceToBookValue", math.Divide(
		p.price,
		math.Divide(p.value("shareholderEquity"), p.value("sharesOutstanding")),
	))
	ratioFinancials[30] = p.format("priceToCashFlow", math.Divide(
		p.price,
		math.Divide(p.value("operatingCashFlow"), p.value("sharesOutstanding")),
	))
	ratioFinancials[31] = p.format("priceToFreeCashFlow", math.Divide(
		p.price,
		math.Divide(p.value("freeCashFlow"), p.value("sharesOutstanding")),
	))
	ratioFinancials[32] = p.format("priceToEarnings", math.Divide(
		p.price,
		p.value("eps"),
	))
	ratioFinancials[33] = p.format("priceToSales", math.Divide(
		p.price,
		math.Divide(p.value("revenue"), p.value("sharesOutstanding")),
	))

	return ratioFinancials
}

func (p financialRatioPeriodProcessor) format(
	fiSlug string,
	value float64,
) domain.Financial {
	return domain.Financial{
		FinancialBase: domain.FinancialBase{
			Value:           value,
			Year:            p.year,
			Period:          p.period,
			ReportDate:      p.reportDate,
			IsEstimate:      false,
			FinancialItemId: p.financialItemMap[fiSlug].Id,
		},
		SecurityId: p.securityId,
		SectorId:   p.sectorId,
	}
}

func (p financialRatioPeriodProcessor) ratio(left []string, right []string) float64 {
	leftValues := slices.Map(left, p.value)
	rightValues := slices.Map(right, p.value)
	return math.Sum(leftValues...) / math.Sum(rightValues...)
}

func (p financialRatioPeriodProcessor) value(slug string) float64 {
	return p.financials[slug].Value
}
