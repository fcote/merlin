package handler

import (
	"context"
	"strings"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const chunkSize = 100

type FullSync struct {
	ticker          TickerLister
	security        SecuritySyncer
	historicalPrice HistoricalPriceSyncer
	financial       FinancialSyncer
	earning         EarningSyncer
	news            NewsSyncer
}

func NewFullSync(
	tickerLister TickerLister,
	companySyncer SecuritySyncer,
	historicalPriceSyncer HistoricalPriceSyncer,
	financialSyncer FinancialSyncer,
	earningSyncer EarningSyncer,
	newsSyncer NewsSyncer,
) FullSync {
	return FullSync{
		ticker:          tickerLister,
		security:        companySyncer,
		historicalPrice: historicalPriceSyncer,
		financial:       financialSyncer,
		earning:         earningSyncer,
		news:            newsSyncer,
	}
}

func (fs FullSync) Handle() error {
	ctx := context.Background()

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

	syncerr := fs.news.SyncSecurityNews(ctx, securities)
	if syncerr != nil {
		syncerr.Log()
		return
	}

	syncerr = fs.earning.SyncEarnings(ctx, securities)
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
