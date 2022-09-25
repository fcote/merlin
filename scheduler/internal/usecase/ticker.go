package usecase

import (
	"context"
)

type TickerUsecase struct {
	fetch DataFetch
}

func NewTickerUsecase(fetch DataFetch) TickerUsecase {
	return TickerUsecase{
		fetch: fetch,
	}
}

func (uc TickerUsecase) ListTickers(ctx context.Context) ([]string, error) {
	return uc.fetch.SecurityTickerList(ctx)
}
