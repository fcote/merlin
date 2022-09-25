package domain

import (
	"fmt"

	"github.com/rs/zerolog/log"
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

func (e SyncError) Log() {
	log.Error().Err(e.err).Fields(e.Fields()).Msg(e.message)
}

func (e SyncError) Error() string {
	return fmt.Sprintf("%s | %s: %v", e.ticker, e.message, e.err)
}

type SyncErrors []SyncError

func (errs SyncErrors) Log() {
	for _, syncError := range errs {
		syncError.Log()
	}
}
