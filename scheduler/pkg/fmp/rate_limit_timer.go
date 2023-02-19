package fmp

import (
	"sync"
	"time"

	"github.com/fcote/merlin/sheduler/pkg/glog"
)

const timerDuration = 1 * time.Minute

// RateLimitTimer is a timer that keeps track of the number of requests
type RateLimitTimer struct {
	timer             *time.Timer
	end               time.Time
	nRequests         int
	maxRequestsPerMin int

	mu sync.Mutex
}

// NewRateLimitTimer creates a new RateLimitTimer
func NewRateLimitTimer(maxRequestsPerMin int) *RateLimitTimer {
	t := &RateLimitTimer{
		end:               time.Now().Add(timerDuration),
		maxRequestsPerMin: maxRequestsPerMin,
	}
	t.timer = time.AfterFunc(timerDuration, t.reset)

	return t
}

// Wait blocks until the next request can be made
func (t *RateLimitTimer) Wait() {
	t.mu.Lock()
	defer t.mu.Unlock()

	t.nRequests++
	glog.Get().Debug().Msgf("fmp | rate limit | %d/%d", t.nRequests, t.maxRequestsPerMin)

	if t.nRequests >= t.maxRequestsPerMin {
		timeToWait := time.Until(t.end)
		glog.Get().Debug().Msgf("fmp | rate limit | waiting %.2fs", timeToWait.Seconds())

		<-time.After(timeToWait)
	}
}

// reset the number of requests made and the timer
func (t *RateLimitTimer) reset() {
	t.mu.Lock()
	defer t.mu.Unlock()

	t.nRequests = 0

	glog.Get().Debug().Msg("fmp | rate limit | reset")

	t.timer.Reset(timerDuration)
	t.end = time.Now().Add(timerDuration)
}
