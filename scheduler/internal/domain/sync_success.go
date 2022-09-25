package domain

import "github.com/rs/zerolog/log"

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

func (s SyncSuccess) Log() {
	log.Info().Fields(s.Fields()).Msg(s.message)
}
