package gmonitor

import (
	"context"
	"net/http"
	"os"

	"github.com/newrelic/go-agent/v3/newrelic"

	"github.com/fcote/merlin/sheduler/config"
)

var monitor *newrelic.Application

func InitMonitor(license string) error {
	app, err := newrelic.NewApplication(
		newrelic.ConfigAppName("merlin-scheduler"),
		newrelic.ConfigLicense(license),
		newrelic.ConfigAppLogForwardingEnabled(true),
		newrelic.ConfigAppLogDecoratingEnabled(true),
		newrelic.ConfigInfoLogger(os.Stdout),
	)
	if err != nil {
		return err
	}
	monitor = app
	return nil
}

func Get() *newrelic.Application {
	return monitor
}

func StartExternalSegment(ctx context.Context, req *http.Request) *newrelic.ExternalSegment {
	return newrelic.StartExternalSegment(FromContext(ctx).NewGoroutine(), req)
}

func StartDatastoreSegment(ctx context.Context, table string, op string, query string) *newrelic.DatastoreSegment {
	tx := FromContext(ctx)
	return &newrelic.DatastoreSegment{
		StartTime:          tx.StartSegmentNow(),
		Product:            newrelic.DatastorePostgres,
		Collection:         table,
		Operation:          op,
		ParameterizedQuery: query,
		DatabaseName:       config.Get().DB.Name,
		Host:               config.Get().DB.Host,
	}
}

func StartAsyncDatastoreSegment(ctx context.Context, table string, op string, query string) *newrelic.DatastoreSegment {
	tx := FromContext(ctx).NewGoroutine()
	return &newrelic.DatastoreSegment{
		StartTime:          tx.StartSegmentNow(),
		Product:            newrelic.DatastorePostgres,
		Collection:         table,
		Operation:          op,
		ParameterizedQuery: query,
		DatabaseName:       config.Get().DB.Name,
		Host:               config.Get().DB.Host,
	}
}

func NewContext(ctx context.Context, name string) context.Context {
	tx := Get().StartTransaction(name)
	return newrelic.NewContext(ctx, tx)
}

func FromContext(ctx context.Context) *newrelic.Transaction {
	return newrelic.FromContext(ctx)
}
