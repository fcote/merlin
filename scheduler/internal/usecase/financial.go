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

var financialConcurrency = runtime.GOMAXPROCS(0)

type FinancialUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewFinancialUsecase(
	store DataStore,
	fetch DataFetch,
) FinancialUsecase {
	return FinancialUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc FinancialUsecase) SyncSecurityFinancials(ctx context.Context, securities map[string]int, prices map[string]domain.HistoricalPrices) error {
	financialItemMap, err := uc.store.GetFinancialItemMap(ctx)
	if err != nil {
		return fmt.Errorf("could not fetch financial item map: %w", err)
	}

	p := pool.New().
		WithErrors().
		WithContext(ctx).
		WithMaxGoroutines(financialConcurrency)

	uc.launchSyncs(p, securities, prices, financialItemMap)

	if err := p.Wait(); err != nil {
		return err
	}

	return nil
}

func (uc FinancialUsecase) launchSyncs(
	pool *pool.ContextPool,
	securities map[string]int,
	prices map[string]domain.HistoricalPrices,
	financialItemMap map[string]domain.FinancialItem,
) {
	for ticker, securityId := range securities {
		task := domain.SecurityTask{
			Ticker:     ticker,
			SecurityId: securityId,
		}
		pool.Go(uc.sync(task, financialItemMap, prices))
	}
}

func (uc FinancialUsecase) sync(
	task domain.SecurityTask,
	financialItemMap map[string]domain.FinancialItem,
	prices map[string]domain.HistoricalPrices,
) func(ctx context.Context) error {
	return func(ctx context.Context) error {
		ctx = gmonitor.NewContext(ctx, "sync.security.financial")
		defer gmonitor.FromContext(ctx).End()

		tickerPrices := prices[task.Ticker]
		rawFinancials, err := uc.fetch.Financials(ctx, task.Ticker, financialItemMap)
		if err != nil {
			return fmt.Errorf("%s | could not fetch financials: %w", task.Ticker, err)
		}

		var ids []int
		err = uc.store.Atomic(ctx, func(s DataStore) error {
			financialInputs := slices.Map(rawFinancials, func(p domain.FinancialBase) domain.Financial {
				return domain.FinancialFromBase(p, &task.SecurityId, nil)
			})
			financialIds, err := s.BatchInsertSecurityFinancials(ctx, financialInputs)
			if err != nil {
				return err
			}

			ttmProcessor := NewFinancialTTMProcessor(financialInputs, financialItemMap)
			ttmFinancialInputs := ttmProcessor.Compute()
			ttmFinancialIds, err := s.BatchInsertSecurityFinancials(ctx, ttmFinancialInputs)
			if err != nil {
				return err
			}

			ratioProcessor := NewFinancialRatioProcessor(
				append(financialInputs, ttmFinancialInputs...),
				financialItemMap,
				tickerPrices,
			)
			ratioFinancialInputs := ratioProcessor.Compute()
			ratioFinancialIds, err := s.BatchInsertSecurityFinancials(ctx, ratioFinancialInputs)
			if err != nil {
				return err
			}

			glog.Info().Msgf(
				"%s | security financials | count-financials: %d | count-ratios: %d | count-ttm: %d",
				task.Ticker,
				len(financialIds),
				len(ratioFinancialIds),
				len(ttmFinancialIds),
			)

			ids = append(ids, financialIds...)
			ids = append(ids, ttmFinancialIds...)
			ids = append(ids, ratioFinancialIds...)

			return nil
		})
		if err != nil {
			return fmt.Errorf("%s | could not sync security financials: %w", task.Ticker, err)
		}

		return nil
	}
}
