package newrelic

import (
	"net/http"

	"github.com/newrelic/go-agent/v3/newrelic"

	"github.com/fcote/merlin/sheduler/pkg/monitoring"
)

type Segment struct {
	seg *newrelic.Segment
}

func NewSegment(txn *newrelic.Transaction, name string) *Segment {
	return &Segment{txn.StartSegment(name)}
}

func (s *Segment) End() {
	s.seg.End()
}

type ExternalSegment struct {
	seg *newrelic.ExternalSegment
}

func NewExternalSegment(txn *newrelic.Transaction, req *http.Request) *ExternalSegment {
	return &ExternalSegment{newrelic.StartExternalSegment(txn, req)}
}

func (s *ExternalSegment) End() {
	s.seg.End()
}

type DatastoreSegment struct {
	seg *newrelic.DatastoreSegment
}

func NewDatastoreSegment(txn *newrelic.Transaction, cfg monitoring.DatastoreSegmentConfig) *DatastoreSegment {
	return &DatastoreSegment{&newrelic.DatastoreSegment{
		StartTime:          txn.StartSegmentNow(),
		Product:            newrelic.DatastoreProduct(cfg.Product),
		Collection:         cfg.Collection,
		Operation:          cfg.Operation,
		ParameterizedQuery: cfg.ParameterizedQuery,
		QueryParameters:    cfg.QueryParameters,
	}}
}

func (s *DatastoreSegment) End() {
	s.seg.End()
}
