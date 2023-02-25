package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type SecuritySyncer interface {
	SyncSecurities(ctx context.Context, tickers []string) (map[string]int, map[string]int, error)
}

type SecurityGetter interface {
	GetSecurities(ctx context.Context) (map[string]int, error)
}

type HistoricalPriceSyncer interface {
	SyncSecurityHistoricalPrices(ctx context.Context, securities map[string]int) (map[string]domain.HistoricalPrices, error)
}

type EarningSyncer interface {
	SyncSecurityEarnings(ctx context.Context, securities map[string]int) error
}

type FinancialSecuritySyncer interface {
	SyncSecurityFinancials(ctx context.Context, securities map[string]int, prices map[string]domain.HistoricalPrices) error
}

type FinancialSectorSyncer interface {
	SyncSectorFinancials(ctx context.Context, sector domain.Sector) error
}

type NewsSyncer interface {
	SyncSecurityNews(ctx context.Context, securities map[string]int) error
	SyncNews(ctx context.Context, securities map[string]int) ([]int, error)
}

type ForexSyncer interface {
	SyncForex(ctx context.Context) ([]int, error)
}

type TickerLister interface {
	ListTickers(ctx context.Context) ([]string, error)
}

type SectorLister interface {
	ListSectors(ctx context.Context) (domain.Sectors, error)
}
