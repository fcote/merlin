package usecase

import (
	"context"
	"runtime"
	"sync"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

var financialConcurrency = runtime.NumCPU()

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

func (uc FinancialUsecase) SyncFinancials(ctx context.Context, securities map[string]int, prices map[string]domain.HistoricalPrices) domain.SyncErrors {
	var errors domain.SyncErrors

	financialItemMap, err := uc.store.GetFinancialItemMap(ctx)
	if err != nil {
		errors = append(errors, *domain.NewSyncError("", "could not fetch financial item map", err))
		return errors
	}

	wg := sync.WaitGroup{}
	jobs := make(chan securityPair, financialConcurrency)

	for i := 0; i < financialConcurrency; i++ {
		go uc.worker(ctx, errors, &wg, jobs, financialItemMap, prices)
	}

	uc.feed(securities, &wg, jobs)

	wg.Wait()

	close(jobs)

	return errors
}

func (uc FinancialUsecase) feed(securities map[string]int, wg *sync.WaitGroup, jobs chan<- securityPair) {
	for ticker, securityId := range securities {
		wg.Add(1)
		jobs <- securityPair{ticker, securityId}
	}
}

func (uc FinancialUsecase) worker(
	ctx context.Context,
	errors domain.SyncErrors,
	wg *sync.WaitGroup,
	jobs <-chan securityPair,
	financialItemMap map[string]domain.FinancialItem,
	prices map[string]domain.HistoricalPrices,
) {
	for job := range jobs {
		if err := uc.sync(ctx, job.ticker, job.securityId, financialItemMap, prices[job.ticker]); err != nil {
			errors = append(errors, *err)
		}
		wg.Done()
	}
}

func (uc FinancialUsecase) sync(
	ctx context.Context,
	ticker string, securityId int,
	financialItemMap map[string]domain.FinancialItem,
	prices domain.HistoricalPrices,
) *domain.SyncError {
	ctx = gmonitor.NewContext(ctx, "sync.financial")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawFinancials, err := uc.fetch.Financials(ctx, ticker, financialItemMap)
	if err != nil {
		return domain.NewSyncError(ticker, "could not fetch financials", err)
	}

	err = uc.store.Atomic(ctx, func(s DataStore) error {
		financialInputs := slices.Map(rawFinancials, func(p domain.FinancialBase) domain.Financial {
			return domain.FinancialFromBase(p, &securityId, nil)
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

		ratioProcessor := NewFinancialRatioProcessor(financialInputs, financialItemMap, prices)
		ratioFinancialInputs := ratioProcessor.Compute()
		ratioFinancialIds, err := s.BatchInsertSecurityFinancials(ctx, ratioFinancialInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced financials | count-financials: %d | count-ratios: %d | count-ttm: %d",
			ticker,
			len(financialIds),
			len(ratioFinancialIds),
			len(ttmFinancialIds),
		)

		return nil
	})
	if err != nil {
		return domain.NewSyncError(ticker, "could not sync financials", err)
	}

	return nil
}
