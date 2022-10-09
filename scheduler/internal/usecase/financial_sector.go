package usecase

import (
	"context"
	"fmt"
	"runtime"
	"sync"

	"github.com/rs/zerolog/log"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
)

var sectorFinancialConcurrency = runtime.NumCPU()

type sectorJob struct {
	sector domain.Sector
	year   int
	period domain.FinancialPeriod
}

type FinancialSectorUsecase struct {
	store DataStore
}

func NewFinancialSectorUsecase(
	store DataStore,
) FinancialSectorUsecase {
	return FinancialSectorUsecase{
		store: store,
	}
}

func (uc FinancialSectorUsecase) SyncSectorFinancials(ctx context.Context, sector domain.Sector) domain.SyncErrors {
	var sectorPeriods []domain.FinancialYearPeriod

	err := uc.store.Atomic(ctx, func(s DataStore) error {
		periods, err := s.GetSectorFinancialPeriods(ctx, sector.Id)
		if err != nil {
			return err
		}
		sectorPeriods = periods
		return nil
	})
	if err != nil {
		return domain.SyncErrors{*domain.NewSyncError(sector.Name, "could not sync sector financials", err)}
	}

	var errors domain.SyncErrors
	wg := sync.WaitGroup{}
	jobs := make(chan sectorJob, sectorFinancialConcurrency)
	results := make(chan financialResult)

	for i := 0; i < sectorFinancialConcurrency; i++ {
		go uc.worker(ctx, jobs, results)
	}

	go uc.collect(&wg, results, &errors)

	uc.feed(sector, sectorPeriods, &wg, jobs)

	wg.Wait()

	close(jobs)
	close(results)

	return errors
}

func (uc FinancialSectorUsecase) feed(sector domain.Sector, sectorPeriods []domain.FinancialYearPeriod, wg *sync.WaitGroup, jobs chan<- sectorJob) {
	for _, period := range sectorPeriods {
		wg.Add(1)
		jobs <- sectorJob{sector, period.Year, period.Period}
	}
}

func (uc FinancialSectorUsecase) worker(
	ctx context.Context,
	jobs <-chan sectorJob,
	results chan<- financialResult,
) {
	for job := range jobs {
		ids, err := uc.sync(ctx, job)
		if err != nil {
			results <- financialResult{err: err}
		} else {
			results <- financialResult{ids: ids}
		}
	}
}

func (uc FinancialSectorUsecase) collect(
	wg *sync.WaitGroup,
	results <-chan financialResult,
	errors *domain.SyncErrors,
) {
	for r := range results {
		if r.err != nil {
			*errors = append(*errors, *r.err)
		}
		wg.Done()
	}
}

func (uc FinancialSectorUsecase) sync(ctx context.Context, job sectorJob) ([]int, *domain.SyncError) {
	ctx = gmonitor.NewContext(ctx, "sync.security.sector")
	defer gmonitor.FromContext(ctx).End()

	var sectorFinancialIds []int
	err := uc.store.Atomic(ctx, func(s DataStore) error {
		sectorFinancials, err := s.GetSectorFinancials(ctx, job.sector.Id, domain.FinancialTypeRatio, job.year, job.period)
		if err != nil {
			return err
		}

		financialInputs := uc.computeFinancialMedians(sectorFinancials, job)

		sectorFinancialIds, err = s.BatchInsertSectorFinancials(ctx, financialInputs)
		if err != nil {
			return err
		}

		log.Info().Msgf(
			"%s | successfully synced sector financials | count: %d | source-financials: %d",
			fmt.Sprintf("%s-%d-%s", job.sector.Name, job.year, job.period),
			len(financialInputs),
			len(sectorFinancials),
		)

		return nil
	})
	if err != nil {
		return nil, domain.NewSyncError(job.sector.Name, "could not sync sector financials", err)
	}

	return sectorFinancialIds, nil
}

func (uc FinancialSectorUsecase) computeFinancialMedians(sectorFinancials domain.Financials, job sectorJob) domain.Financials {
	financialItemValues := make(map[int][]float64)

	for _, financial := range sectorFinancials {
		financialItemValues[financial.FinancialItemId] = append(
			financialItemValues[financial.FinancialItemId],
			financial.Value,
		)
	}

	var financials domain.Financials
	for financialItemId, values := range financialItemValues {
		financials = append(financials, domain.Financial{
			FinancialBase: domain.FinancialBase{
				Value:           math.Median(values...),
				Year:            job.year,
				Period:          job.period,
				IsEstimate:      false,
				FinancialItemId: financialItemId,
			},
			SectorId: pointer.To(job.sector.Id),
		})
	}

	return financials
}
