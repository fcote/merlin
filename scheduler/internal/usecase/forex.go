package usecase

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
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

func (uc ForexUsecase) SyncForex(ctx context.Context) ([]int, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.forex")
	defer gmonitor.FromContext(ctx).End()

	forexInputs, err := uc.fetch.Forex(ctx)
	if err != nil {
		return nil, domain.NewSyncError("", "could not fetch forex", err)
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
		return nil, domain.NewSyncError("", "could not sync forex", err)
	}

	return forexIds, nil
}
