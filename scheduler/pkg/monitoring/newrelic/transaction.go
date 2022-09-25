package newrelic

import (
	"context"
	"net/http"

	"github.com/newrelic/go-agent/v3/newrelic"

	"github.com/fcote/merlin/sheduler/pkg/monitoring"
)

type Transaction struct {
	txn *newrelic.Transaction
}

func NewTransactor(app *newrelic.Application, name string) *Transaction {
	return &Transaction{app.StartTransaction(name)}
}

func NewTransactorWithContext(app *newrelic.Application, name string) context.Context {
	txn := app.StartTransaction(name)
	ctx := newrelic.NewContext(context.Background(), txn)
	return ctx
}

func FromContext(ctx context.Context) *Transaction {
	txn := newrelic.FromContext(ctx)
	return &Transaction{txn}
}

func (t *Transaction) NewGoroutine() monitoring.Transactor {
	return &Transaction{t.txn.NewGoroutine()}
}

func (t *Transaction) AddAttribute(key string, value interface{}) {
	t.txn.AddAttribute(key, value)
}

func (t *Transaction) StartSegment(name string) monitoring.Segmenter {
	return NewSegment(t.txn, name)
}

func (t *Transaction) StartExternalSegment(req *http.Request) monitoring.Segmenter {
	return NewExternalSegment(t.txn, req)
}

func (t *Transaction) StartDatastoreSegment(cfg monitoring.DatastoreSegmentConfig) monitoring.Segmenter {
	return NewDatastoreSegment(t.txn, cfg)
}

func (t *Transaction) SetName(name string) {
	t.txn.SetName(name)
}

func (t *Transaction) Ignore() {
	t.txn.Ignore()
}

func (t *Transaction) End() {
	t.txn.End()
}
