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

var financialConcurrency = runtime.GOMAXPROCS(0)

type financialResult struct {
	err *domain.SyncError
	ids []int
}

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

func (uc FinancialUsecase) SyncSecurityFinancials(ctx context.Context, securities map[string]int, prices map[string]domain.HistoricalPrices) domain.SyncErrors {
	financialItemMap, err := uc.store.GetFinancialItemMap(ctx)
	if err != nil {
		return domain.SyncErrors{*domain.NewSyncError("", "could not fetch financial item map", err)}
	}

	_, errors := worker.NewPool(
		financialConcurrency,
		uc.sync(financialItemMap, prices),
	).Run(ctx, domain.SecurityTasks(securities))
	return errors
}

func (uc FinancialUsecase) sync(
	financialItemMap map[string]domain.FinancialItem,
	prices map[string]domain.HistoricalPrices,
) func(ctx context.Context, task domain.SecurityTask) ([]int, *domain.SyncError) {
	return func(ctx context.Context, task domain.SecurityTask) ([]int, *domain.SyncError) {
		ctx = gmonitor.NewContext(ctx, "sync.security.financial")
		defer gmonitor.FromContext(ctx).End()
		log := glog.Get()

		tickerPrices := prices[task.Ticker]
		rawFinancials, err := uc.fetch.Financials(ctx, task.Ticker, financialItemMap)
		if err != nil {
			return nil, domain.NewSyncError(task.Ticker, "could not fetch financials", err)
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

			ratioProcessor := NewFinancialRatioProcessor(financialInputs, financialItemMap, tickerPrices)
			ratioFinancialInputs := ratioProcessor.Compute()
			ratioFinancialIds, err := s.BatchInsertSecurityFinancials(ctx, ratioFinancialInputs)
			if err != nil {
				return err
			}

			log.Info().Msgf(
				"%s | successfully synced security financials | count-financials: %d | count-ratios: %d | count-ttm: %d",
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
			return nil, domain.NewSyncError(task.Ticker, "could not sync security financials", err)
		}

		return ids, nil
	}
}
