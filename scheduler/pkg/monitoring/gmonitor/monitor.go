package gmonitor

import (
	"context"

	"github.com/fcote/merlin/sheduler/pkg/monitoring"
	"github.com/fcote/merlin/sheduler/pkg/monitoring/newrelic"
)

func FromContext(ctx context.Context) monitoring.Transactor {
	return newrelic.FromContext(ctx)
}
