package usecase

import (
	"context"
	"sync"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const historicalPriceConcurrency = 50

type securityPair struct {
	ticker     string
	securityId int
}

type priceResult struct {
	err    *domain.SyncError
	ticker string
	res    domain.HistoricalPrices
}

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
	var errors domain.SyncErrors

	wg := &sync.WaitGroup{}
	jobs := make(chan securityPair, historicalPriceConcurrency)
	results := make(chan priceResult)
	prices := make(map[string]domain.HistoricalPrices)

	for i := 0; i < historicalPriceConcurrency; i++ {
		go uc.worker(ctx, jobs, results)
	}

	go uc.collect(results, wg, prices, &errors)

	uc.feed(securities, wg, jobs)

	wg.Wait()

	close(jobs)
	close(results)

	return prices, errors
}

func (uc HistoricalPriceUsecase) feed(securities map[string]int, wg *sync.WaitGroup, jobs chan<- securityPair) {
	for ticker, securityId := range securities {
		wg.Add(1)
		jobs <- securityPair{ticker, securityId}
	}
}

func (uc HistoricalPriceUsecase) collect(
	results <-chan priceResult,
	wg *sync.WaitGroup,
	prices map[string]domain.HistoricalPrices,
	errors *domain.SyncErrors,
) {
	for r := range results {
		if r.err != nil {
			*errors = append(*errors, *r.err)
		} else {
			prices[r.ticker] = r.res
		}
		wg.Done()
	}
}

func (uc HistoricalPriceUsecase) worker(
	ctx context.Context,
	jobs <-chan securityPair,
	results chan<- priceResult,
) {
	for job := range jobs {
		res, err := uc.sync(ctx, job.ticker, job.securityId)
		if err != nil {
			results <- priceResult{err: err, ticker: job.ticker}
		} else {
			results <- priceResult{res: res, ticker: job.ticker}
		}
	}
}

func (uc HistoricalPriceUsecase) sync(ctx context.Context, ticker string, securityId int) (domain.HistoricalPrices, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.historicalprice")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawHistoricalPrices, err := uc.fetch.HistoricalPrices(ctx, ticker)
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not fetch historical prices", err)
	}

	var historicalPriceInputs domain.HistoricalPrices
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		historicalPriceInputs = slices.
			Map(rawHistoricalPrices, func(p domain.HistoricalPriceBase) domain.HistoricalPrice {
				return domain.HistoricalPriceFromBase(p, securityId)
			})
		result, err := s.
			BatchInsertHistoricalPrices(ctx, historicalPriceInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced historical prices | count: %d",
			ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not sync historical prices", err)
	}

	return historicalPriceInputs, nil
}
