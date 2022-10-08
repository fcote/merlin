package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type NewsSync struct {
	security SecurityGetter
	news     NewsSyncer
}

func NewNewsSync(
	securityGetter SecurityGetter,
	newsSyncer NewsSyncer,
) NewsSync {
	return NewsSync{
		security: securityGetter,
		news:     newsSyncer,
	}
}

func (ns NewsSync) Handle() error {
	ctx := context.Background()

	securities, getErr := ns.security.GetSecurities(ctx)
	if getErr != nil {
		getErr.Log()
		return nil
	}

	newsIds, syncErr := ns.news.SyncNews(ctx, securities)
	if syncErr != nil {
		syncErr.Log()
		return nil
	}

	domain.NewSyncSuccess(nil, "news sync success", len(newsIds), len(newsIds)).Log()

	return nil
}
