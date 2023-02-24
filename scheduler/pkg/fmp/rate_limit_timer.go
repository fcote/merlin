package fmp

import (
	"time"

	"go.uber.org/atomic"
)

const timerDuration = 1 * time.Minute

// RateLimitTimer is a timer that keeps track of the number of requests
type RateLimitTimer struct {
	timer             *time.Timer
	end               *atomic.Time
	nRequests         *atomic.Uint64
	maxRequestsPerMin uint64
}

// NewRateLimitTimer creates a new RateLimitTimer
func NewRateLimitTimer(maxRequestsPerMin int) *RateLimitTimer {
	t := &RateLimitTimer{
		end:               atomic.NewTime(time.Now().Add(timerDuration)),
		nRequests:         atomic.NewUint64(0),
		maxRequestsPerMin: uint64(maxRequestsPerMin),
	}
	t.timer = time.AfterFunc(timerDuration, t.reset)

	return t
}

// Wait blocks until the next request can be made
func (t *RateLimitTimer) Wait() {
	t.nRequests.Add(1)

	if t.nRequests.Load() >= t.maxRequestsPerMin {
		timeToWait := time.Until(t.end.Load())
		<-time.After(timeToWait)
	}
}

// reset the number of requests made and the timer
func (t *RateLimitTimer) reset() {
	t.nRequests.Store(0)

	t.timer.Reset(timerDuration)
	t.end.Store(time.Now().Add(timerDuration))
}
