package handler

import (
	"context"
	"strings"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/monitoring"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const chunkSize = 100

type SecuritySyncer interface {
	SyncSecurities(ctx context.Context, tickers []string) (map[string]int, *domain.SyncError)
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

type TickerLister interface {
	ListTickers(ctx context.Context) ([]string, error)
}

type FullSync struct {
	monitor         monitoring.Monitor
	ticker          TickerLister
	security        SecuritySyncer
	historicalPrice HistoricalPriceSyncer
	financial       FinancialSyncer
	earning         EarningSyncer
}

func NewFullSync(
	monitor monitoring.Monitor,
	tickerLister TickerLister,
	companySyncer SecuritySyncer,
	historicalPriceSyncer HistoricalPriceSyncer,
	financialSyncer FinancialSyncer,
	earningSyncer EarningSyncer,
) FullSync {
	return FullSync{
		monitor:         monitor,
		ticker:          tickerLister,
		security:        companySyncer,
		historicalPrice: historicalPriceSyncer,
		financial:       financialSyncer,
		earning:         earningSyncer,
	}
}

func (fs FullSync) Handle() error {
	ctx := fs.monitor.StartTransactionWithContext("full-sync")

	tickers, err := fs.ticker.ListTickers(ctx)
	if err != nil {
		return err
	}
	tickers = slices.Filter(tickers, func(ticker string) bool {
		return !strings.Contains(ticker, ".") &&
			!strings.Contains(ticker, "-") &&
			len(ticker) > 0
	})

	total := len(tickers)
	tickerChunks := slices.Chunk(tickers, chunkSize)

	for index, tickerChunk := range tickerChunks {
		fs.syncChunk(ctx, index, total, tickerChunk)
	}

	return nil
}

func (fs FullSync) syncChunk(ctx context.Context, index int, total int, tickers []string) {
	progress := index*chunkSize + len(tickers)

	securities, err := fs.security.SyncSecurities(ctx, tickers)
	if err != nil {
		err.Log()
		return
	}

	syncerr := fs.earning.SyncEarnings(ctx, securities)
	if syncerr != nil {
		syncerr.Log()
		return
	}

	prices, syncerr := fs.historicalPrice.SyncHistoricalPrices(ctx, securities)
	if syncerr != nil {
		syncerr.Log()
		return
	}

	syncerr = fs.financial.SyncFinancials(ctx, securities, prices)
	if syncerr != nil {
		syncerr.Log()
		return
	}

	domain.NewSyncSuccess(tickers, "securities sync success", progress, total).Log()
}
