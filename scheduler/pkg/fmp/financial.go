package fmp

import "context"

type Period string

const (
	PeriodYear    Period = "year"
	PeriodQuarter Period = "quarter"
)

func (p Period) String() string {
	return string(p)
}

type IncomeStatement struct {
	Date                                    string  `json:"date"`
	Symbol                                  string  `json:"symbol"`
	ReportedCurrency                        string  `json:"reportedCurrency"`
	Cik                                     string  `json:"cik"`
	FillingDate                             string  `json:"fillingDate"`
	AcceptedDate                            string  `json:"acceptedDate"`
	CalendarYear                            string  `json:"calendarYear"`
	Period                                  string  `json:"period"`
	Revenue                                 float64 `json:"revenue"`
	CostOfRevenue                           float64 `json:"costOfRevenue"`
	GrossProfit                             float64 `json:"grossProfit"`
	GrossProfitRatio                        float64 `json:"grossProfitRatio"`
	ResearchAndDevelopmentExpenses          float64 `json:"researchAndDevelopmentExpenses"`
	GeneralAndAdministrativeExpenses        float64 `json:"generalAndAdministrativeExpenses"`
	SellingAndMarketingExpenses             float64 `json:"sellingAndMarketingExpenses"`
	SellingGeneralAndAdministrativeExpenses float64 `json:"sellingGeneralAndAdministrativeExpenses"`
	OtherExpenses                           float64 `json:"otherExpenses"`
	OperatingExpenses                       float64 `json:"operatingExpenses"`
	CostAndExpenses                         float64 `json:"costAndExpenses"`
	InterestIncome                          float64 `json:"interestIncome"`
	InterestExpense                         float64 `json:"interestExpense"`
	DepreciationAndAmortization             float64 `json:"depreciationAndAmortization"`
	Ebitda                                  float64 `json:"ebitda"`
	EbitdaRatio                             float64 `json:"ebitdaRatio"`
	OperatingIncome                         float64 `json:"operatingIncome"`
	OperatingIncomeRatio                    float64 `json:"operatingIncomeRatio"`
	TotalOtherIncomeExpensesNet             float64 `json:"totalOtherIncomeExpensesNet"`
	IncomeBeforeTax                         float64 `json:"incomeBeforeTax"`
	IncomeBeforeTaxRatio                    float64 `json:"incomeBeforeTaxRatio"`
	IncomeTaxExpense                        float64 `json:"incomeTaxExpense"`
	NetIncome                               float64 `json:"netIncome"`
	NetIncomeRatio                          float64 `json:"netIncomeRatio"`
	Eps                                     float64 `json:"eps"`
	EpsDiluted                              float64 `json:"epsDiluted"`
	WeightedAverageShsOut                   float64 `json:"weightedAverageShsOut"`
	WeightedAverageShsOutDil                float64 `json:"weightedAverageShsOutDil"`
	Link                                    string  `json:"link"`
	FinalLink                               string  `json:"finalLink"`
}

func (fmp FMP) IncomeStatements(ctx context.Context, ticker string, period Period) ([]IncomeStatement, error) {
	url := fmp.url.JoinPath("/v3/income-statement/", ticker)
	q := url.Query()
	q.Add("period", period.String())
	url.RawQuery = q.Encode()

	var statements []IncomeStatement
	if err := fmp.request(ctx, url, &statements); err != nil {
		return nil, err
	}

	return statements, nil
}

type BalanceSheetStatement struct {
	Date                                    string  `json:"date"`
	Symbol                                  string  `json:"symbol"`
	ReportedCurrency                        string  `json:"reportedCurrency"`
	Cik                                     string  `json:"cik"`
	FillingDate                             string  `json:"fillingDate"`
	AcceptedDate                            string  `json:"acceptedDate"`
	CalendarYear                            string  `json:"calendarYear"`
	Period                                  string  `json:"period"`
	CashAndCashEquivalents                  float64 `json:"cashAndCashEquivalents"`
	ShortTermInvestments                    float64 `json:"shortTermInvestments"`
	CashAndShortTermInvestments             float64 `json:"cashAndShortTermInvestments"`
	NetReceivables                          float64 `json:"netReceivables"`
	Inventory                               float64 `json:"inventory"`
	OtherCurrentAssets                      float64 `json:"otherCurrentAssets"`
	TotalCurrentAssets                      float64 `json:"totalCurrentAssets"`
	PropertyPlantEquipmentNet               float64 `json:"propertyPlantEquipmentNet"`
	Goodwill                                float64 `json:"goodwill"`
	IntangibleAssets                        float64 `json:"intangibleAssets"`
	GoodwillAndIntangibleAssets             float64 `json:"goodwillAndIntangibleAssets"`
	LongTermInvestments                     float64 `json:"longTermInvestments"`
	TaxAssets                               float64 `json:"taxAssets"`
	OtherNonCurrentAssets                   float64 `json:"otherNonCurrentAssets"`
	TotalNonCurrentAssets                   float64 `json:"totalNonCurrentAssets"`
	OtherAssets                             float64 `json:"otherAssets"`
	TotalAssets                             float64 `json:"totalAssets"`
	AccountPayables                         float64 `json:"accountPayables"`
	ShortTermDebt                           float64 `json:"shortTermDebt"`
	TaxPayables                             float64 `json:"taxPayables"`
	DeferredRevenue                         float64 `json:"deferredRevenue"`
	OtherCurrentLiabilities                 float64 `json:"otherCurrentLiabilities"`
	TotalCurrentLiabilities                 float64 `json:"totalCurrentLiabilities"`
	LongTermDebt                            float64 `json:"longTermDebt"`
	DeferredRevenueNonCurrent               float64 `json:"deferredRevenueNonCurrent"`
	DeferredTaxLiabilitiesNonCurrent        float64 `json:"deferredTaxLiabilitiesNonCurrent"`
	OtherNonCurrentLiabilities              float64 `json:"otherNonCurrentLiabilities"`
	TotalNonCurrentLiabilities              float64 `json:"totalNonCurrentLiabilities"`
	OtherLiabilities                        float64 `json:"otherLiabilities"`
	CapitalLeaseObligations                 float64 `json:"capitalLeaseObligations"`
	TotalLiabilities                        float64 `json:"totalLiabilities"`
	PreferredStock                          float64 `json:"preferredStock"`
	CommonStock                             float64 `json:"commonStock"`
	RetainedEarnings                        float64 `json:"retainedEarnings"`
	AccumulatedOtherComprehensiveIncomeLoss float64 `json:"accumulatedOtherComprehensiveIncomeLoss"`
	OtherTotalStockholdersEquity            float64 `json:"othertotalStockholdersEquity"`
	TotalStockholdersEquity                 float64 `json:"totalStockholdersEquity"`
	TotalLiabilitiesAndStockholdersEquity   float64 `json:"totalLiabilitiesAndStockholdersEquity"`
	MinorityInterest                        float64 `json:"minorityInterest"`
	TotalEquity                             float64 `json:"totalEquity"`
	TotalLiabilitiesAndTotalEquity          float64 `json:"totalLiabilitiesAndTotalEquity"`
	TotalInvestments                        float64 `json:"totalInvestments"`
	TotalDebt                               float64 `json:"totalDebt"`
	NetDebt                                 float64 `json:"netDebt"`
	Link                                    string  `json:"link"`
	FinalLink                               string  `json:"finalLink"`
}

func (fmp FMP) BalanceSheetStatements(ctx context.Context, ticker string, period Period) ([]BalanceSheetStatement, error) {
	url := fmp.url.JoinPath("/v3/balance-sheet-statement/", ticker)
	q := url.Query()
	q.Add("period", period.String())
	url.RawQuery = q.Encode()

	var statements []BalanceSheetStatement
	if err := fmp.request(ctx, url, &statements); err != nil {
		return nil, err
	}

	return statements, nil
}

type CashFlowStatement struct {
	Date                                     string  `json:"date"`
	Symbol                                   string  `json:"symbol"`
	ReportedCurrency                         string  `json:"reportedCurrency"`
	Cik                                      string  `json:"cik"`
	FillingDate                              string  `json:"fillingDate"`
	AcceptedDate                             string  `json:"acceptedDate"`
	CalendarYear                             string  `json:"calendarYear"`
	Period                                   string  `json:"period"`
	NetIncome                                float64 `json:"netIncome"`
	DepreciationAndAmortization              float64 `json:"depreciationAndAmortization"`
	DeferredIncomeTax                        float64 `json:"deferredIncomeTax"`
	StockBasedCompensation                   float64 `json:"stockBasedCompensation"`
	ChangeInWorkingCapital                   float64 `json:"changeInWorkingCapital"`
	AccountsReceivables                      float64 `json:"accountsReceivables"`
	Inventory                                float64 `json:"inventory"`
	AccountsPayables                         float64 `json:"accountsPayables"`
	OtherWorkingCapital                      float64 `json:"otherWorkingCapital"`
	OtherNonCashItems                        float64 `json:"otherNonCashItems"`
	NetCashProvidedByOperatingActivities     float64 `json:"netCashProvidedByOperatingActivities"`
	InvestmentsInPropertyPlantAndEquipment   float64 `json:"investmentsInPropertyPlantAndEquipment"`
	AcquisitionsNet                          float64 `json:"acquisitionsNet"`
	PurchasesOfInvestments                   float64 `json:"purchasesOfInvestments"`
	SalesMaturitiesOfInvestments             float64 `json:"salesMaturitiesOfInvestments"`
	OtherInvestingActivites                  float64 `json:"otherInvestingActivites"`
	NetCashUsedForInvestingActivites         float64 `json:"netCashUsedForInvestingActivites"`
	DebtRepayment                            float64 `json:"debtRepayment"`
	CommonStockIssued                        float64 `json:"commonStockIssued"`
	CommonStockRepurchased                   float64 `json:"commonStockRepurchased"`
	DividendsPaid                            float64 `json:"dividendsPaid"`
	OtherFinancingActivites                  float64 `json:"otherFinancingActivites"`
	NetCashUsedProvidedByFinancingActivities float64 `json:"netCashUsedProvidedByFinancingActivities"`
	EffectOfForexChangesOnCash               float64 `json:"effectOfForexChangesOnCash"`
	NetChangeInCash                          float64 `json:"netChangeInCash"`
	CashAtEndOfPeriod                        float64 `json:"cashAtEndOfPeriod"`
	CashAtBeginningOfPeriod                  float64 `json:"cashAtBeginningOfPeriod"`
	OperatingCashFlow                        float64 `json:"operatingCashFlow"`
	CapitalExpenditure                       float64 `json:"capitalExpenditure"`
	FreeCashFlow                             float64 `json:"freeCashFlow"`
	Link                                     string  `json:"link"`
	FinalLink                                string  `json:"finalLink"`
}

func (fmp FMP) CashFlowStatements(ctx context.Context, ticker string, period Period) ([]CashFlowStatement, error) {
	url := fmp.url.JoinPath("/v3/cash-flow-statement/", ticker)
	q := url.Query()
	q.Add("period", period.String())
	url.RawQuery = q.Encode()

	var statements []CashFlowStatement
	if err := fmp.request(ctx, url, &statements); err != nil {
		return nil, err
	}

	return statements, nil
}
