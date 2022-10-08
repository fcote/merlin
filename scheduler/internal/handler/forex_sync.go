package handler

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
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
	if err != nil {
		err.Log()
		return nil
	}

	domain.NewSyncSuccess(nil, "forex sync success", len(forexIds), len(forexIds)).Log()

	return nil
}
