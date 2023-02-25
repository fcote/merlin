package glog

import (
	"os"

	"github.com/newrelic/go-agent/v3/integrations/logcontext-v2/nrzerolog"
	"github.com/newrelic/go-agent/v3/newrelic"
	"github.com/rs/zerolog"
)

var logger zerolog.Logger

func InitLogger(app *newrelic.Application) {
	baseLogger := zerolog.New(os.Stdout)
	nrHook := nrzerolog.NewRelicHook{
		App: app,
	}
	logger = baseLogger.Hook(nrHook)
}

func Info() *zerolog.Event {
	return logger.Info()
}

func Error() *zerolog.Event {
	return logger.Error()
}

func Fatal() *zerolog.Event {
	return logger.Fatal()
}
