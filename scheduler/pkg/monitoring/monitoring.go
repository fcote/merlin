package monitoring

import (
	"context"
	"net/http"
)

type Monitor interface {
	StartTransaction(name string) Transactor
	StartTransactionWithContext(name string) context.Context
}

type Transactor interface {
	NewGoroutine() Transactor
	AddAttribute(key string, value interface{})
	StartSegment(name string) Segmenter
	StartExternalSegment(req *http.Request) Segmenter
	StartDatastoreSegment(cfg DatastoreSegmentConfig) Segmenter
	SetName(name string)
	Ignore()
	End()
}

type Segmenter interface {
	End()
}

type DatastoreSegmentConfig struct {
	Product            string
	Collection         string
	Operation          string
	ParameterizedQuery string
	QueryParameters    map[string]interface{}
}
