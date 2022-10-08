package fmp

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

func (r Repository) Forex(ctx context.Context) (domain.Forexes, error) {
	forex, err := r.client.Forex(ctx)
	if err != nil {
		return nil, err
	}

	var result domain.Forexes
	for _, forex := range forex {
		result = append(result, ForexFromFMPForex(forex))
	}

	return result, nil
}

func ForexFromFMPForex(fmpForex fmp.Forex) domain.Forex {
	from := fmpForex.Symbol[:3]
	to := fmpForex.Symbol[3:]
	return domain.Forex{
		FromCurrency: from,
		ToCurrency:   to,
		ExchangeRate: fmpForex.Price,
	}
}
