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

var newsConcurrency = runtime.NumCPU()

type newsResult struct {
	err    *domain.SyncError
	ticker string
}

type NewsUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewNewsUsecase(
	store DataStore,
	fetch DataFetch,
) NewsUsecase {
	return NewsUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc NewsUsecase) SyncSecurityNews(ctx context.Context, securities map[string]int) domain.SyncErrors {
	var errors domain.SyncErrors

	wg := &sync.WaitGroup{}
	jobs := make(chan securityPair, newsConcurrency)
	results := make(chan newsResult)

	for i := 0; i < newsConcurrency; i++ {
		go uc.worker(ctx, jobs, results)
	}

	go uc.collect(results, wg, errors)

	uc.feed(securities, wg, jobs)

	wg.Wait()

	close(jobs)
	close(results)

	return errors
}

func (uc NewsUsecase) feed(securities map[string]int, wg *sync.WaitGroup, jobs chan<- securityPair) {
	for ticker, securityId := range securities {
		wg.Add(1)
		jobs <- securityPair{ticker, securityId}
	}
}

func (uc NewsUsecase) collect(
	results <-chan newsResult,
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

func (uc NewsUsecase) worker(
	ctx context.Context,
	jobs <-chan securityPair,
	results chan<- newsResult,
) {
	for job := range jobs {
		_, err := uc.sync(ctx, job.ticker, job.securityId)
		results <- newsResult{err: err, ticker: job.ticker}
	}
}

func (uc NewsUsecase) sync(ctx context.Context, ticker string, securityId int) (domain.Newses, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.news")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawNews, err := uc.fetch.SecurityNews(ctx, ticker)
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not fetch news", err)
	}

	var newsInputs domain.Newses
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		newsInputs = slices.Map(rawNews, func(p domain.NewsBase) domain.News {
			return domain.NewsFromBase(p, securityId)
		})
		result, err := s.BatchInsertNews(ctx, newsInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced news | count: %d",
			ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(ticker, "could not sync news", err)
	}

	return newsInputs, nil
}

func (uc NewsUsecase) SyncNews(ctx context.Context, securities map[string]int) ([]int, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.news")
	defer gmonitor.FromContext(ctx).End()

	rawNews, err := uc.fetch.News(ctx)
	if err != nil {
		return nil, domain.NewSyncError("", "could not fetch news", err)
	}

	var newsIds []int
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		var newsInputs domain.Newses
		for _, n := range rawNews {
			securityId, ok := securities[n.Ticker]
			if !ok {
				continue
			}
			newsInputs = append(newsInputs, domain.NewsFromBase(n, securityId))
		}

		newsIds, err = s.BatchInsertNews(ctx, newsInputs)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError("", "could not sync news", err)
	}

	return newsIds, nil
}
