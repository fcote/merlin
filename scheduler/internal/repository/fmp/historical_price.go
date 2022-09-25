package fmp

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

func (r Repository) HistoricalPrices(ctx context.Context, ticker string) ([]domain.HistoricalPriceBase, error) {
	historicalPrices, err := r.client.HistoricalPrices(ctx, ticker)
	if err != nil {
		return nil, err
	}

	result := make([]domain.HistoricalPriceBase, len(historicalPrices))
	for i, historicalPrice := range historicalPrices {
		result[i] = HistoricalPriceBaseFromFMP(historicalPrice)
	}

	return result, nil
}

func HistoricalPriceBaseFromFMP(fmpHistoricalPrice fmp.HistoricalPrice) domain.HistoricalPriceBase {
	return domain.HistoricalPriceBase{
		Date:          fmpHistoricalPrice.Date,
		Open:          fmpHistoricalPrice.Open,
		High:          fmpHistoricalPrice.High,
		Low:           fmpHistoricalPrice.Low,
		Close:         fmpHistoricalPrice.Close,
		Volume:        fmpHistoricalPrice.Volume / 1e6,
		Change:        fmpHistoricalPrice.Change,
		ChangePercent: fmpHistoricalPrice.ChangePercent,
	}
}
