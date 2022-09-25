package newrelic

import (
	"context"

	"github.com/newrelic/go-agent/v3/newrelic"

	"github.com/fcote/merlin/sheduler/pkg/monitoring"
)

type Monitoring struct {
	app *newrelic.Application
}

func NewMonitor(name, license string) (*Monitoring, error) {
	newRelicApp, err := newrelic.NewApplication(
		newrelic.ConfigAppName(name),
		newrelic.ConfigLicense(license),
		newrelic.ConfigEnabled(true),
	)
	if err != nil {
		return nil, err
	}
	return &Monitoring{newRelicApp}, nil
}

func (m Monitoring) StartTransaction(name string) monitoring.Transactor {
	return NewTransactor(m.app, name)
}

func (m Monitoring) StartTransactionWithContext(name string) context.Context {
	return NewTransactorWithContext(m.app, name)
}
