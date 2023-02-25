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

var newsConcurrency = runtime.GOMAXPROCS(0)

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

func (uc NewsUsecase) SyncSecurityNews(ctx context.Context, securities map[string]int) error {
	p := pool.New().
		WithErrors().
		WithContext(ctx).
		WithMaxGoroutines(newsConcurrency)

	uc.launchSyncs(p, securities)

	if err := p.Wait(); err != nil {
		return err
	}

	return nil
}

func (uc NewsUsecase) launchSyncs(pool *pool.ContextPool, securities map[string]int) {
	for ticker, securityId := range securities {
		pool.Go(func(ctx context.Context) error {
			return uc.sync(ctx, domain.SecurityTask{
				Ticker:     ticker,
				SecurityId: securityId,
			})
		})
	}
}

func (uc NewsUsecase) sync(ctx context.Context, task domain.SecurityTask) error {
	ctx = gmonitor.NewContext(ctx, "sync.security.news")
	defer gmonitor.FromContext(ctx).End()

	rawNews, err := uc.fetch.SecurityNews(ctx, task.Ticker)
	if err != nil {
		return fmt.Errorf("%s | could not fetch news: %w", task.Ticker, err)
	}

	var newsInputs domain.Newses
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		newsInputs = slices.Map(rawNews, func(p domain.NewsBase) domain.News {
			return domain.NewsFromBase(p, task.SecurityId)
		})
		result, err := s.BatchInsertNews(ctx, newsInputs)
		if err != nil {
			return err
		}

		glog.Info().Msgf(
			"%s | news | count: %d",
			task.Ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return fmt.Errorf("%s | could not fetch news: %w", task.Ticker, err)
	}

	return nil
}

func (uc NewsUsecase) SyncNews(ctx context.Context, securities map[string]int) ([]int, error) {
	ctx = gmonitor.NewContext(ctx, "sync.news")
	defer gmonitor.FromContext(ctx).End()

	rawNews, err := uc.fetch.News(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not fetch news: %w", err)
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
		return nil, fmt.Errorf("could not sync news: %w", err)
	}

	return newsIds, nil
}
