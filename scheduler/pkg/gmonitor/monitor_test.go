package gmonitor

import "testing"

func TestMonitoringIsOptional(t *testing.T) {
	if err := InitMonitor(""); err != nil {
		t.Fatalf("scheduler must start without a New Relic license: %v", err)
	}
	if Get() == nil {
		t.Fatal("expected a disabled monitoring application")
	}
	transaction := Get().StartTransaction("test")
	transaction.End()
}
