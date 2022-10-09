package usecase

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type DataStore interface {
	Atomic(ctx context.Context, fn func(repo DataStore) error) error

	GetFinancialItemMap(ctx context.Context) (map[string]domain.FinancialItem, error)
	BatchInsertHistoricalPrices(ctx context.Context, securities domain.HistoricalPrices) ([]int, error)
	BatchInsertSecurities(ctx context.Context, securities domain.Securities) ([]int, error)
	BatchInsertCompanies(ctx context.Context, companies domain.Companies) ([]int, error)
	BatchInsertSectors(ctx context.Context, sectors domain.Sectors) ([]int, error)
	BatchInsertIndustries(ctx context.Context, industries domain.Industries) ([]int, error)
	BatchInsertSecurityFinancials(ctx context.Context, financialItems domain.Financials) ([]int, error)
	BatchInsertSectorFinancials(ctx context.Context, financials domain.Financials) ([]int, error)
	BatchInsertEarnings(ctx context.Context, earnings domain.Earnings) ([]int, error)
	BatchInsertNews(ctx context.Context, news domain.Newses) ([]int, error)
	BatchInsertForex(ctx context.Context, forex domain.Forexes) ([]int, error)

	GetSectors(ctx context.Context) (domain.Sectors, error)
	GetSecurities(ctx context.Context) (domain.Securities, error)
	GetSectorFinancials(ctx context.Context, sectorId int, statementType domain.FinancialType, year int, period domain.FinancialPeriod) (domain.Financials, error)
	GetSectorFinancialPeriods(ctx context.Context, sectorId int) ([]domain.FinancialYearPeriod, error)
}

type DataFetch interface {
	Companies(ctx context.Context, tickers []string) ([]domain.CompanyBase, error)
	SecurityTickerList(ctx context.Context) ([]string, error)
	Securities(ctx context.Context, tickers []string) ([]domain.SecurityBase, error)
	HistoricalPrices(ctx context.Context, ticker string) ([]domain.HistoricalPriceBase, error)
	Financials(ctx context.Context, ticker string, financialItemMap map[string]domain.FinancialItem) ([]domain.FinancialBase, error)
	Earnings(ctx context.Context, ticker string) ([]domain.EarningBase, error)
	SecurityNews(ctx context.Context, ticker string) ([]domain.NewsBase, error)
	News(ctx context.Context) ([]domain.NewsBase, error)
	Forex(ctx context.Context) (domain.Forexes, error)
}
