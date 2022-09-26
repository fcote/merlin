package main

import (
	"context"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/rs/zerolog/log"

	"github.com/go-co-op/gocron"

	"github.com/fcote/merlin/sheduler/config"
	"github.com/fcote/merlin/sheduler/internal/handler"
	"github.com/fcote/merlin/sheduler/internal/repository/fmp"
	"github.com/fcote/merlin/sheduler/internal/repository/pg"
	"github.com/fcote/merlin/sheduler/internal/usecase"
	fmpclient "github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func main() {
	conf := config.New()

	// Monitoring
	if err := gmonitor.InitMonitor(conf.NewRelic.License); err != nil {
		log.Fatal().Msgf("failed to initialize monitor: %v", err)
	}

	glog.InitLogger(gmonitor.Get())
	logger := glog.Get()

	// DB
	pgConf, err := pgxpool.ParseConfig(conf.Database.ConnectionString())
	if err != nil {
		logger.Fatal().Msgf("failed to initialize database config: %v", err)
	}
	dbPool, err := pgxpool.ConnectConfig(context.Background(), pgConf)
	if err != nil {
		logger.Fatal().Msgf("failed to initialize database: %v", err)
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
	newsUsecase := usecase.NewNewsUsecase(pgRepository, fmpRepository)

	// Handlers
	fullSyncHandler := handler.NewFullSync(
		tickerUsecase,
		companyUsecase,
		historicalPriceUsecase,
		financialUsecase,
		earningUsecase,
		newsUsecase,
	)

	// Load timezone
	location, err := time.LoadLocation(conf.Timezone)
	if err != nil {
		logger.Fatal().Msgf("failed to load timezone from config: %v", err)
	}

	// Scheduler
	s := gocron.NewScheduler(location)

	if conf.FullSync.Enabled {
		_, err := s.CronWithSeconds(conf.FullSync.Rule).LimitRunsTo(1).Do(fullSyncHandler.Handle)
		if err != nil {
			logger.Fatal().Msgf("failed to initialize full sync job: %v", err)
		}
	}

	s.StartBlocking()
}
