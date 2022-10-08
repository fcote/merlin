package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type SecuritySyncer interface {
	SyncSecurities(ctx context.Context, tickers []string) (map[string]int, *domain.SyncError)
}

type SecurityGetter interface {
	GetSecurities(ctx context.Context) (map[string]int, *domain.SyncError)
}

type HistoricalPriceSyncer interface {
	SyncHistoricalPrices(ctx context.Context, securities map[string]int) (map[string]domain.HistoricalPrices, domain.SyncErrors)
}

type EarningSyncer interface {
	SyncEarnings(ctx context.Context, securities map[string]int) domain.SyncErrors
}

type FinancialSyncer interface {
	SyncFinancials(ctx context.Context, securities map[string]int, prices map[string]domain.HistoricalPrices) domain.SyncErrors
}

type NewsSyncer interface {
	SyncSecurityNews(ctx context.Context, securities map[string]int) domain.SyncErrors
	SyncNews(ctx context.Context, securities map[string]int) ([]int, *domain.SyncError)
}

type ForexSyncer interface {
	SyncForex(ctx context.Context) ([]int, *domain.SyncError)
}

type TickerLister interface {
	ListTickers(ctx context.Context) ([]string, error)
}
