package handler

import (
	"context"
	"errors"
	"strings"

	"github.com/fcote/merlin/sheduler/internal/domain"
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
	tickers = slices.Filter(tickers, fs.isTickerValid)

	total := len(tickers)
	tickerChunks := slices.Chunk(tickers, chunkSize)
	for index, tickerChunk := range tickerChunks {
		fs.syncSecurities(ctx, index, total, tickerChunk)
	}

	fs.syncSectors(ctx)

	return nil
}

func (fs FullSync) isTickerValid(ticker string) bool {
	return !strings.Contains(ticker, ".") &&
		!strings.Contains(ticker, "-") &&
		len(ticker) > 0
}

func (fs FullSync) syncSecurities(ctx context.Context, index int, total int, tickers []string) {
	progress := index*chunkSize + len(tickers)

	securities, commonStocks, err := fs.security.SyncSecurities(ctx, tickers)
	prices, err := fs.syncSecurityHistoricalPrices(ctx, err, securities)
	err = fs.syncSecurityNews(ctx, err, commonStocks)
	err = fs.syncSecurityEarnings(ctx, err, commonStocks)
	err = fs.syncSecurityFinancials(ctx, err, commonStocks, prices)

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

func (fs FullSync) syncSecurityHistoricalPrices(ctx context.Context, err error, securities map[string]int) (map[string]domain.HistoricalPrices, error) {
	if len(securities) == 0 {
		return nil, err
	}
	prices, pricesErr := fs.historicalPrice.SyncSecurityHistoricalPrices(ctx, securities)
	return prices, errors.Join(err, pricesErr)
}

func (fs FullSync) syncSecurityNews(ctx context.Context, err error, commonStocks map[string]int) error {
	if len(commonStocks) == 0 {
		return err
	}
	return errors.Join(err, fs.news.SyncSecurityNews(ctx, commonStocks))
}

func (fs FullSync) syncSecurityEarnings(ctx context.Context, err error, commonStocks map[string]int) error {
	if len(commonStocks) == 0 {
		return err
	}
	return errors.Join(err, fs.earning.SyncSecurityEarnings(ctx, commonStocks))
}

func (fs FullSync) syncSecurityFinancials(ctx context.Context, err error, commonStocks map[string]int, prices map[string]domain.HistoricalPrices) error {
	if len(commonStocks) == 0 || len(prices) == 0 {
		return err
	}
	return errors.Join(err, fs.financialSecurity.SyncSecurityFinancials(ctx, commonStocks, prices))
}

func (fs FullSync) syncSectors(ctx context.Context) {
	sectors, err := fs.sector.ListSectors(ctx)
	if err != nil {
		glog.Error().Msgf("sector sync | could not list sectors: %v", err)
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
