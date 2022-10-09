package usecase

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type SectorUsecase struct {
	store DataStore
}

func NewSectorUsecase(
	store DataStore,
) SectorUsecase {
	return SectorUsecase{
		store: store,
	}
}

func (uc SectorUsecase) ListSectors(ctx context.Context) (domain.Sectors, error) {
	var err error
	var sectors domain.Sectors
	err = uc.store.Atomic(ctx, func(s DataStore) error {
		sectors, err = s.GetSectors(ctx)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return sectors, nil
}
