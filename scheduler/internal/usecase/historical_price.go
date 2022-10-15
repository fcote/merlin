package usecase

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/internal/helper/worker"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const historicalPriceConcurrency = 50

type HistoricalPriceUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewHistoricalPriceUsecase(
	store DataStore,
	fetch DataFetch,
) HistoricalPriceUsecase {
	return HistoricalPriceUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc HistoricalPriceUsecase) SyncSecurityHistoricalPrices(ctx context.Context, securities map[string]int) (map[string]domain.HistoricalPrices, domain.SyncErrors) {
	return worker.NewPool(
		historicalPriceConcurrency,
		uc.sync,
	).Run(ctx, domain.SecurityTasks(securities))
}

func (uc HistoricalPriceUsecase) sync(ctx context.Context, task domain.SecurityTask) (domain.HistoricalPrices, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.historicalprice")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawHistoricalPrices, err := uc.fetch.HistoricalPrices(ctx, task.Ticker)
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not fetch historical prices", err)
	}

	var historicalPriceInputs domain.HistoricalPrices
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		historicalPriceInputs = slices.
			Map(rawHistoricalPrices, func(p domain.HistoricalPriceBase) domain.HistoricalPrice {
				return domain.HistoricalPriceFromBase(p, task.SecurityId)
			})
		result, err := s.
			BatchInsertHistoricalPrices(ctx, historicalPriceInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced historical prices | count: %d",
			task.Ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not sync historical prices", err)
	}

	return historicalPriceInputs, nil
}
