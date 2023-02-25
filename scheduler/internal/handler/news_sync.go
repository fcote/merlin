package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/pkg/glog"
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

	securities, err := ns.security.GetSecurities(ctx)
	if err != nil {
		glog.Error().Err(err).Msg("news sync failed")
		return nil
	}

	newsIds, err := ns.news.SyncNews(ctx, securities)

	switch {
	case err != nil:
		glog.Error().Msgf("%d/%d | news sync\n%v", len(newsIds), len(newsIds), err)
	default:
		glog.Info().Msgf("%d/%d | news sync", len(newsIds), len(newsIds))
	}

	return nil
}
