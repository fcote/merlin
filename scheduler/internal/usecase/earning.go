package usecase

import (
	"context"
	"runtime"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/internal/helper/worker"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

var earningConcurrency = runtime.GOMAXPROCS(0)

type EarningUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewEarningUsecase(
	store DataStore,
	fetch DataFetch,
) EarningUsecase {
	return EarningUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc EarningUsecase) SyncSecurityEarnings(ctx context.Context, securities map[string]int) domain.SyncErrors {
	_, errors := worker.NewPool(
		earningConcurrency,
		uc.sync,
	).Run(ctx, domain.SecurityTasks(securities))
	return errors
}

func (uc EarningUsecase) sync(ctx context.Context, task domain.SecurityTask) (domain.Earnings, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.earning")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawEarnings, err := uc.fetch.Earnings(ctx, task.Ticker)
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not fetch earnings", err)
	}

	var earningInputs domain.Earnings
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		earningInputs = slices.
			Map(rawEarnings, func(p domain.EarningBase) domain.Earning {
				return domain.EarningFromBase(p, task.SecurityId)
			})
		result, err := s.
			BatchInsertEarnings(ctx, earningInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced earnings | count: %d",
			task.Ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not sync earnings", err)
	}

	return earningInputs, nil
}
