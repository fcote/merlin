package fmp

import (
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

type Repository struct {
	client *fmp.FMP
}

func NewRepository(client fmp.FMP) Repository {
	return Repository{
		client: &client,
	}
}
