package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/glog"
)

type SyncSuccess struct {
	tickers  []string
	message  string
	progress int
	total    int
}

func NewSyncSuccess(tickers []string, message string, progress int, total int) *SyncSuccess {
	return &SyncSuccess{
		tickers:  tickers,
		message:  message,
		progress: progress,
		total:    total,
	}
}

func (s SyncSuccess) Fields() map[string]interface{} {
	return map[string]interface{}{
		"tickers":  s.tickers,
		"progress": s.progress,
		"total":    s.total,
	}
}

func (s SyncSuccess) String() string {
	return fmt.Sprintf("%d/%d | %s | %v", s.progress, s.total, s.message, s.tickers)
}

func (s SyncSuccess) Log() {
	glog.Get().Info().Msg(s.String())
}
