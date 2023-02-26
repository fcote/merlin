package usecase

import (
	"context"
	"fmt"

	"github.com/sourcegraph/conc/pool"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

var historicalPriceConcurrency = 50

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

func (uc HistoricalPriceUsecase) SyncSecurityHistoricalPrices(ctx context.Context, securities map[string]int) (map[string]domain.HistoricalPrices, error) {
	p := pool.NewWithResults[*domain.SyncResult[domain.HistoricalPrices]]().
		WithErrors().
		WithContext(ctx).
		WithMaxGoroutines(historicalPriceConcurrency)

	uc.launchSyncs(p, securities)

	res, errs := p.Wait()
	if errs != nil {
		return nil, errs
	}

	return domain.MapSyncResults(res), nil
}

func (uc HistoricalPriceUsecase) launchSyncs(pool *pool.ResultContextPool[*domain.SyncResult[domain.HistoricalPrices]], securities map[string]int) {
	for ticker, securityId := range securities {
		pool.Go(func(ctx context.Context) (*domain.SyncResult[domain.HistoricalPrices], error) {
			return uc.sync(ctx, domain.SecurityTask{
				Ticker:     ticker,
				SecurityId: securityId,
			})
		})
	}
}

func (uc HistoricalPriceUsecase) sync(ctx context.Context, task domain.SecurityTask) (*domain.SyncResult[domain.HistoricalPrices], error) {
	ctx = gmonitor.NewContext(ctx, "sync.security.historicalprice")
	defer gmonitor.FromContext(ctx).End()

	rawHistoricalPrices, err := uc.fetch.HistoricalPrices(ctx, task.Ticker)
	if err != nil {
		return nil, fmt.Errorf("%s | could not fetch historical prices: %w", task.Ticker, err)
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

		glog.Info().Msgf(
			"%s | historical prices | count: %d",
			task.Ticker,
			len(result),
		)
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("%s | could not sync historical prices: %w", task.Ticker, err)
	}

	return domain.NewSyncResult(task.Ticker, historicalPriceInputs), nil
}
