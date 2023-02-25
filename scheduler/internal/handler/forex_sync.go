package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/pkg/glog"
)

type ForexSync struct {
	forex ForexSyncer
}

func NewForexSync(
	forexSyncer ForexSyncer,
) ForexSync {
	return ForexSync{
		forex: forexSyncer,
	}
}

func (ns ForexSync) Handle() error {
	ctx := context.Background()

	forexIds, err := ns.forex.SyncForex(ctx)

	switch {
	case err != nil:
		glog.Error().Msgf("%d/%d | forex sync\n%v", len(forexIds), len(forexIds), err)
	default:
		glog.Info().Msgf("%d/%d | forex sync", len(forexIds), len(forexIds))
	}

	return nil
}
