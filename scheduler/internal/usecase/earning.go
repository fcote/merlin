package usecase

import (
	"context"
	"fmt"
	"runtime"

	"github.com/sourcegraph/conc/pool"

	"github.com/fcote/merlin/sheduler/internal/domain"
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

func (uc EarningUsecase) SyncSecurityEarnings(ctx context.Context, securities map[string]int) error {
	p := pool.New().
		WithErrors().
		WithContext(ctx).
		WithMaxGoroutines(earningConcurrency)

	uc.launchSyncs(p, securities)

	if err := p.Wait(); err != nil {
		return err
	}

	return nil
}

func (uc EarningUsecase) launchSyncs(pool *pool.ContextPool, securities map[string]int) {
	for ticker, securityId := range securities {
		pool.Go(func(ctx context.Context) error {
			return uc.sync(ctx, domain.SecurityTask{
				Ticker:     ticker,
				SecurityId: securityId,
			})
		})
	}
}

func (uc EarningUsecase) sync(ctx context.Context, task domain.SecurityTask) error {
	ctx = gmonitor.NewContext(ctx, "sync.security.earning")
	defer gmonitor.FromContext(ctx).End()

	rawEarnings, err := uc.fetch.Earnings(ctx, task.Ticker)
	if err != nil {
		return fmt.Errorf("%s | could not fetch earnings: %w", task.Ticker, err)
	}

	var earningInputs domain.Earnings
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		earningInputs = slices.
			Map(rawEarnings, func(p domain.EarningBase) domain.Earning {
				return domain.EarningFromBase(p, task.SecurityId)
			})
		result, err := s.BatchInsertEarnings(ctx, earningInputs)
		if err != nil {
			return err
		}

		glog.Info().Msgf(
			"%s | earnings | count: %d",
			task.Ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return fmt.Errorf("%s | could not sync earnings: %w", task.Ticker, err)
	}

	return nil
}
