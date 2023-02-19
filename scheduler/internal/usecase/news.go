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

func (uc NewsUsecase) SyncSecurityNews(ctx context.Context, securities map[string]int) domain.SyncErrors {
	_, errors := worker.NewPool(
		newsConcurrency,
		uc.sync,
	).Run(ctx, domain.SecurityTasks(securities))
	return errors
}

func (uc NewsUsecase) sync(ctx context.Context, task domain.SecurityTask) (domain.Newses, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.news")
	defer gmonitor.FromContext(ctx).End()
	log := glog.Get()

	rawNews, err := uc.fetch.SecurityNews(ctx, task.Ticker)
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not fetch news", err)
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

		log.Info().Msgf(
			"%s | successfully synced news | count: %d",
			task.Ticker,
			len(result),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(task.Ticker, "could not sync news", err)
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
