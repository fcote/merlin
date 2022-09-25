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
	BatchInsertEarnings(ctx context.Context, earnings domain.Earnings) ([]int, error)
}

type DataFetch interface {
	Companies(ctx context.Context, tickers []string) ([]domain.CompanyBase, error)
	SecurityTickerList(ctx context.Context) ([]string, error)
	Securities(ctx context.Context, tickers []string) ([]domain.SecurityBase, error)
	HistoricalPrices(ctx context.Context, ticker string) ([]domain.HistoricalPriceBase, error)
	Financials(ctx context.Context, ticker string, financialItemMap map[string]domain.FinancialItem) ([]domain.FinancialBase, error)
	Earnings(ctx context.Context, ticker string) ([]domain.EarningBase, error)
}
