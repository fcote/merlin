package newrelic

import (
	"context"
	"os"

	"github.com/newrelic/go-agent/v3/newrelic"

	"github.com/fcote/merlin/sheduler/pkg/monitoring"
)

type Monitoring struct {
	App *newrelic.Application
}

func NewMonitor(name, license string) (*Monitoring, error) {
	newRelicApp, err := newrelic.NewApplication(
		newrelic.ConfigAppName(name),
		newrelic.ConfigLicense(license),
		newrelic.ConfigAppLogForwardingEnabled(true),
		newrelic.ConfigAppLogDecoratingEnabled(true),
		newrelic.ConfigInfoLogger(os.Stdout),
	)
	if err != nil {
		return nil, err
	}
	return &Monitoring{newRelicApp}, nil
}

func (m Monitoring) StartTransaction(name string) monitoring.Transactor {
	return NewTransactor(m.App, name)
}

func (m Monitoring) StartTransactionWithContext(name string) context.Context {
	return NewTransactorWithContext(m.App, name)
}
