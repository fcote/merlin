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

var earningConcurrency = runtime.NumCPU()

type earningResult struct {
	err    *domain.SyncError
	ticker string
}

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
	var errors domain.SyncErrors

	wg := &sync.WaitGroup{}
	jobs := make(chan securityPair, earningConcurrency)
	results := make(chan earningResult)

	for i := 0; i < earningConcurrency; i++ {
		go uc.worker(ctx, jobs, results)
	}

	go uc.collect(results, wg, errors)

	uc.feed(securities, wg, jobs)

	wg.Wait()

	close(jobs)
	close(results)

	return errors
}

func (uc EarningUsecase) feed(securities map[string]int, wg *sync.WaitGroup, jobs chan<- securityPair) {
	for ticker, securityId := range securities {
		wg.Add(1)
		jobs <- securityPair{ticker, securityId}
	}
}

func (uc EarningUsecase) collect(
	results <-chan earningResult,
	wg *sync.WaitGroup,
	err domain.SyncErrors,
) {
	for r := range results {
		if r.err != nil {
			err = append(err, *r.err)
		}
		wg.Done()
	}
}

func (uc EarningUsecase) worker(
	ctx context.Context,
	jobs <-chan securityPair,
	results chan<- earningResult,
) {
	for job := range jobs {
		_, err := uc.sync(ctx, job.ticker, job.securityId)
		results <- earningResult{err: err, ticker: job.ticker}
	}
}

func (uc EarningUsecase) sync(ctx context.Context, ticker string, securityId int) (domain.Earnings, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.earning")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawEarnings, err := uc.fetch.Earnings(ctx, ticker)
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not fetch earnings", err)
	}

	var earningInputs domain.Earnings
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		earningInputs = slices.
			Map(rawEarnings, func(p domain.EarningBase) domain.Earning {
				return domain.EarningFromBase(p, securityId)
			})
		result, err := s.
			BatchInsertEarnings(ctx, earningInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced earnings | count: %d",
			ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not sync earnings", err)
	}

	return earningInputs, nil
}
