package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"

	"github.com/go-co-op/gocron/v2"
	_ "go.uber.org/automaxprocs"

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

	// DB
	pgConf, err := pgxpool.ParseConfig(conf.DB.ConnectionString())
	if err != nil {
		glog.Fatal().Msgf("failed to initialize database config: %v", err)
	}
	dbPool, err := pgxpool.NewWithConfig(context.Background(), pgConf)
	if err != nil {
		glog.Fatal().Msgf("failed to initialize database: %v", err)
	}

	defer dbPool.Close()

	// FMP
	fmpClient := fmpclient.NewClient(conf.External.API.FMP.Key)

	// Repositories
	fmpRepository := fmp.NewRepository(fmpClient)
	pgRepository := pg.NewRepository(dbPool)

	// Usecases
	tickerUsecase := usecase.NewTickerUsecase(fmpRepository)
	sectorUsecase := usecase.NewSectorUsecase(pgRepository)
	securityUsecase := usecase.NewSecurityUsecase(pgRepository, fmpRepository)
	historicalPriceUsecase := usecase.NewHistoricalPriceUsecase(pgRepository, fmpRepository)
	financialUsecase := usecase.NewFinancialUsecase(pgRepository, fmpRepository)
	financialSectorUsecase := usecase.NewFinancialSectorUsecase(pgRepository)
	earningUsecase := usecase.NewEarningUsecase(pgRepository, fmpRepository)
	newsUsecase := usecase.NewNewsUsecase(pgRepository, fmpRepository)
	forexUsecase := usecase.NewForexUsecase(pgRepository, fmpRepository)

	// Handlers
	fullSyncHandler := handler.NewFullSync(
		tickerUsecase,
		sectorUsecase,
		securityUsecase,
		historicalPriceUsecase,
		financialUsecase,
		financialSectorUsecase,
		earningUsecase,
		newsUsecase,
	)
	newsHandler := handler.NewNewsSync(
		securityUsecase,
		newsUsecase,
	)
	forexHandler := handler.NewForexSync(
		forexUsecase,
	)

	// Load timezone
	location, err := time.LoadLocation(conf.Timezone)
	if err != nil {
		glog.Fatal().Msgf("failed to load timezone from config: %v", err)
	}

	// Scheduler
	s, err := gocron.NewScheduler(gocron.WithLocation(location), gocron.WithGlobalJobOptions(gocron.WithSingletonMode(gocron.LimitModeReschedule)))
	if err != nil {
		glog.Fatal().Msgf("failed to initialize scheduler: %v", err)
	}
	defer func() {
		if err := s.Shutdown(); err != nil {
			glog.Error().Err(err).Msg("failed to shut down scheduler")
		}
	}()

	if conf.Job.NewsSync.Enabled {
		j, err := s.NewJob(gocron.CronJob(conf.Job.NewsSync.Rule, true), gocron.NewTask(newsHandler.Handle))
		if err != nil {
			glog.Fatal().Msgf("failed to initialize news sync job: %v", err)
		}
		logJobRegistered(j, "news sync")
	}
	if conf.Job.ForexSync.Enabled {
		j, err := s.NewJob(gocron.CronJob(conf.Job.ForexSync.Rule, true), gocron.NewTask(forexHandler.Handle))
		if err != nil {
			glog.Fatal().Msgf("failed to initialize forex sync job: %v", err)
		}
		logJobRegistered(j, "forex sync")
	}
	if conf.Job.FullSync.Enabled {
		j, err := s.NewJob(gocron.CronJob(conf.Job.FullSync.Rule, true), gocron.NewTask(fullSyncHandler.Handle))
		if err != nil {
			glog.Fatal().Msgf("failed to initialize full sync job: %v", err)
		}
		logJobRegistered(j, "full sync")
	}

	s.Start()
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
}

func logJobRegistered(j gocron.Job, name string) {
	time.AfterFunc(1*time.Second, func() {
		next, err := j.NextRun()
		if err != nil {
			glog.Error().Err(err).Msg("failed to get next run")
			return
		}
		glog.Info().Msgf(
			"job | registered %s | next run: %s",
			name,
			next.Format("2006-01-02 15:04:05"),
		)
	})
}
