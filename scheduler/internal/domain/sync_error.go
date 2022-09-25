package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/glog"
)

type SyncError struct {
	ticker  string
	message string
	err     error
}

func NewSyncError(ticker string, description string, err error) *SyncError {
	return &SyncError{
		ticker:  ticker,
		message: description,
		err:     err,
	}
}

func (e SyncError) Fields() map[string]interface{} {
	return map[string]interface{}{
		"ticker": e.ticker,
	}
}

func (e SyncError) Error() string {
	return fmt.Sprintf("%s | %s: %v", e.ticker, e.message, e.err)
}

func (e SyncError) Log() {
	glog.Get().Error().Err(e.err).Msg(e.Error())
}

type SyncErrors []SyncError

func (errs SyncErrors) Log() {
	for _, syncError := range errs {
		syncError.Log()
	}
}
