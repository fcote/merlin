package fmp

import (
	"sync"
	"sync/atomic"
	"time"
)

const timerDuration = 1 * time.Minute

// RateLimitTimer is a timer that keeps track of the number of requests
type RateLimitTimer struct {
	timer             *time.Timer
	end               time.Time
	nRequests         atomic.Uint64
	maxRequestsPerMin uint64

	mu sync.Mutex
}

// NewRateLimitTimer creates a new RateLimitTimer
func NewRateLimitTimer(maxRequestsPerMin int) *RateLimitTimer {
	t := &RateLimitTimer{
		end:               time.Now().Add(timerDuration),
		maxRequestsPerMin: uint64(maxRequestsPerMin),
	}
	t.timer = time.AfterFunc(timerDuration, t.reset)

	return t
}

// Wait blocks until the next request can be made
func (t *RateLimitTimer) Wait() {
	t.nRequests.Add(1)

	if t.nRequests.Load() >= t.maxRequestsPerMin {
		timeToWait := time.Until(t.end)
		<-time.After(timeToWait)
	}
}

// reset the number of requests made and the timer
func (t *RateLimitTimer) reset() {
	t.nRequests.Store(0)

	t.timer.Reset(timerDuration)
	t.end = time.Now().Add(timerDuration)
}
