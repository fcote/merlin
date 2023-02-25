package handler

import (
	"context"
	"strings"

	"github.com/fcote/merlin/sheduler/pkg/glog"
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
) *FullSync {
	return &FullSync{
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

func (fs *FullSync) Handle() error {
	ctx := context.Background()

	tickers, err := fs.ticker.ListTickers(ctx)
	if err != nil {
		return err
	}
	tickers = slices.Filter(tickers, fs.isTickerValid)

	total := len(tickers)
	tickerChunks := slices.Chunk(tickers, chunkSize)
	for index, tickerChunk := range tickerChunks {
		fs.syncSecurities(ctx, index, total, tickerChunk)
	}

	fs.syncSectors(ctx)

	return nil
}

func (fs *FullSync) isTickerValid(ticker string) bool {
	return !strings.Contains(ticker, ".") &&
		!strings.Contains(ticker, "-") &&
		len(ticker) > 0
}

func (fs *FullSync) syncSecurities(ctx context.Context, index int, total int, tickers []string) {
	progress := index*chunkSize + len(tickers)

	err := syncChunk(ctx, fs, tickers)
	switch {
	case err != nil:
		glog.Error().Msgf(
			"%d/%d | securities sync | %v\n%v",
			progress,
			total,
			tickers,
			err,
		)
	default:
		glog.Info().Msgf(
			"%d/%d | securities sync | %v",
			progress,
			total,
			tickers,
		)
	}
}

func (fs *FullSync) syncSectors(ctx context.Context) {
	sectors, err := fs.sector.ListSectors(ctx)
	if err != nil {
		glog.Error().Msgf("sector sync | could not list sectors: %v", err)
		return
	}

	for i, sector := range sectors {
		err := fs.financialSector.SyncSectorFinancials(ctx, sector)
		switch {
		case err != nil:
			glog.Error().Msgf(
				"%d/%d | sector sync | %s\n%v",
				i+1,
				len(sectors),
				sector.Name,
				err,
			)
		default:
			glog.Info().Msgf(
				"%d/%d | sector sync | %s",
				i+1,
				len(sectors),
				sector.Name,
			)
		}
	}
}
