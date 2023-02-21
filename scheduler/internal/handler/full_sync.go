package handler

import (
	"context"
	"strings"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const chunkSize = 100

type FullSync struct {
	ticker            TickerLister
	sector            SectorLister
	security          SecuritySyncer
	historicalPrice   HistoricalPriceSyncer
	financialSecurity FinancialSecuritySyncer
	financialSector   FinancialSectorSyncer
	earning           EarningSyncer
	news              NewsSyncer
}

func NewFullSync(
	tickerLister TickerLister,
	sectorLister SectorLister,
	companySyncer SecuritySyncer,
	historicalPriceSyncer HistoricalPriceSyncer,
	financialSecuritySyncer FinancialSecuritySyncer,
	financialSectorSyncer FinancialSectorSyncer,
	earningSyncer EarningSyncer,
	newsSyncer NewsSyncer,
) FullSync {
	return FullSync{
		ticker:            tickerLister,
		sector:            sectorLister,
		security:          companySyncer,
		historicalPrice:   historicalPriceSyncer,
		financialSecurity: financialSecuritySyncer,
		financialSector:   financialSectorSyncer,
		earning:           earningSyncer,
		news:              newsSyncer,
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

	fs.syncSectors(ctx)

	return nil
}

func (fs FullSync) syncChunk(ctx context.Context, index int, total int, tickers []string) {
	progress := index*chunkSize + len(tickers)

	securities, commonStocks, err := fs.security.SyncSecurities(ctx, tickers)
	if err != nil {
		err.Log()
		return
	}

	prices, syncerr := fs.historicalPrice.SyncSecurityHistoricalPrices(ctx, securities)
	if syncerr != nil {
		syncerr.Log()
		return
	}

	if len(commonStocks) > 0 {
		syncerr := fs.news.SyncSecurityNews(ctx, commonStocks)
		if syncerr != nil {
			syncerr.Log()
			return
		}

		syncerr = fs.earning.SyncSecurityEarnings(ctx, commonStocks)
		if syncerr != nil {
			syncerr.Log()
			return
		}

		syncerr = fs.financialSecurity.SyncSecurityFinancials(ctx, commonStocks, prices)
		if syncerr != nil {
			syncerr.Log()
			return
		}
	}

	domain.NewSyncSuccess(tickers, "securities sync success", progress, total).Log()
}

func (fs FullSync) syncSectors(ctx context.Context) {
	sectors, err := fs.sector.ListSectors(ctx)
	if err != nil {
		domain.NewSyncError("", "could not list sectors", err).Log()
	}

	for i, sector := range sectors {
		if err := fs.financialSector.SyncSectorFinancials(ctx, sector); err != nil {
			err.Log()
		}
		domain.NewSyncSuccess([]string{sector.Name}, "sector sync success", i+1, len(sectors)).Log()
	}
}
