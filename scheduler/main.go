package main

import (
	"context"
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/fcote/merlin/sheduler/config"
	"github.com/fcote/merlin/sheduler/internal/handler"
	"github.com/fcote/merlin/sheduler/internal/repository/fmp"
	"github.com/fcote/merlin/sheduler/internal/repository/pg"
	"github.com/fcote/merlin/sheduler/internal/usecase"
	fmpclient "github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/monitoring/newrelic"

	"github.com/go-co-op/gocron"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	conf := config.New()

	// Monitoring
	monitor, err := newrelic.NewMonitor("merlin-scheduler", conf.NewRelic.License)
	if err != nil {
		log.Fatal().Msgf("failed to initialize monitor: %v", err)
	}

	// DB
	pgConf, err := pgxpool.ParseConfig(conf.Database.ConnectionString())
	if err != nil {
		log.Fatal().Msgf("failed to initialize database config: %v", err)
	}
	dbPool, err := pgxpool.ConnectConfig(context.Background(), pgConf)
	if err != nil {
		log.Fatal().Msgf("failed to initialize database: %v", err)
	}

	// FMP
	fmpClient := fmpclient.NewClient(conf.FMP.ApiKey)

	// Repositories
	fmpRepository := fmp.NewRepository(fmpClient)
	pgRepository := pg.NewRepository(dbPool)

	// Usecases
	tickerUsecase := usecase.NewTickerUsecase(fmpRepository)
	companyUsecase := usecase.NewSecurityUsecase(pgRepository, fmpRepository)
	historicalPriceUsecase := usecase.NewHistoricalPriceUsecase(pgRepository, fmpRepository)
	financialUsecase := usecase.NewFinancialUsecase(pgRepository, fmpRepository)
	earningUsecase := usecase.NewEarningUsecase(pgRepository, fmpRepository)

	// Handlers
	fullSyncHandler := handler.NewFullSync(
		monitor,
		tickerUsecase,
		companyUsecase,
		historicalPriceUsecase,
		financialUsecase,
		earningUsecase,
	)

	// Load timezone
	location, err := time.LoadLocation(conf.Timezone)
	if err != nil {
		log.Fatal().Msgf("failed to load timezone from config: %v", err)
	}

	// Scheduler
	s := gocron.NewScheduler(location)

	if conf.FullSync.Enabled {
		_, err := s.CronWithSeconds(conf.FullSync.Rule).LimitRunsTo(1).Do(fullSyncHandler.Handle)
		if err != nil {
			log.Fatal().Msgf("failed to initialize full sync job: %v", err)
		}
	}

	s.StartBlocking()
}
