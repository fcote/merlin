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
	var errors domain.SyncErrors

	financialItemMap, err := uc.store.GetFinancialItemMap(ctx)
	if err != nil {
		errors = append(errors, *domain.NewSyncError("", "could not fetch financial item map", err))
		return errors
	}

	wg := sync.WaitGroup{}
	jobs := make(chan securityPair, financialConcurrency)
	results := make(chan financialResult)

	for i := 0; i < financialConcurrency; i++ {
		go uc.worker(ctx, financialItemMap, prices, jobs, results)
	}

	go uc.collect(&wg, results, &errors)

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
	financialItemMap map[string]domain.FinancialItem,
	prices map[string]domain.HistoricalPrices,
	jobs <-chan securityPair,
	results chan<- financialResult,
) {
	for job := range jobs {
		ids, err := uc.sync(ctx, job.ticker, job.securityId, financialItemMap, prices[job.ticker])
		if err != nil {
			results <- financialResult{err: err}
		} else {
			results <- financialResult{ids: ids}
		}
	}
}

func (uc FinancialUsecase) collect(
	wg *sync.WaitGroup,
	results <-chan financialResult,
	errors *domain.SyncErrors,
) {
	for r := range results {
		if r.err != nil {
			*errors = append(*errors, *r.err)
		}
		wg.Done()
	}
}

func (uc FinancialUsecase) sync(
	ctx context.Context,
	ticker string,
	securityId int,
	financialItemMap map[string]domain.FinancialItem,
	prices domain.HistoricalPrices,
) ([]int, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.financial")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawFinancials, err := uc.fetch.Financials(ctx, ticker, financialItemMap)
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not fetch financials", err)
	}

	var ids []int
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
			"%s | successfully synced security financials | count-financials: %d | count-ratios: %d | count-ttm: %d",
			ticker,
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
		return nil, domain.NewSyncError(ticker, "could not sync security financials", err)
	}

	return ids, nil
}
