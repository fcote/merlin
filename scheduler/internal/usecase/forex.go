package usecase

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

type ForexUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewForexUsecase(
	store DataStore,
	fetch DataFetch,
) ForexUsecase {
	return ForexUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc ForexUsecase) SyncForex(ctx context.Context) ([]int, error) {
	ctx = gmonitor.NewContext(ctx, "sync.forex")
	defer gmonitor.FromContext(ctx).End()

	forexInputs, err := uc.fetch.Forex(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not fetch forex: %w", err)
	}

	var forexIds []int
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		forexIds, err = s.BatchInsertForex(ctx, forexInputs)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("could not sync forex: %w", err)
	}

	return forexIds, nil
}
