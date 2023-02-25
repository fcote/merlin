package usecase

import (
	"context"
	"fmt"
	"runtime"

	"github.com/sourcegraph/conc/pool"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/glog"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
)

var sectorFinancialConcurrency = runtime.GOMAXPROCS(0)

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

func (uc FinancialSectorUsecase) SyncSectorFinancials(ctx context.Context, sector domain.Sector) error {
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
		return fmt.Errorf("%s | could not fetch sector financial periods: %w", sector.Name, err)
	}

	p := pool.New().
		WithErrors().
		WithContext(ctx).
		WithMaxGoroutines(sectorFinancialConcurrency)

	uc.launchSyncs(p, sector, sectorPeriods)

	if err := p.Wait(); err != nil {
		return err
	}

	return nil
}

func (uc FinancialSectorUsecase) launchSyncs(pool *pool.ContextPool, sector domain.Sector, sectorPeriods []domain.FinancialYearPeriod) {
	for _, period := range sectorPeriods {
		pool.Go(func(ctx context.Context) error {
			return uc.sync(ctx, sectorJob{
				sector: sector,
				year:   period.Year,
				period: period.Period,
			})
		})
	}
}

func (uc FinancialSectorUsecase) sync(ctx context.Context, job sectorJob) error {
	ctx = gmonitor.NewContext(ctx, "sync.security.sector")
	defer gmonitor.FromContext(ctx).End()

	err := uc.store.Atomic(ctx, func(s DataStore) error {
		sectorFinancials, err := s.GetSectorFinancials(ctx, job.sector.Id, domain.FinancialTypeRatio, job.year, job.period)
		if err != nil {
			return err
		}

		financialInputs := uc.computeFinancialMedians(sectorFinancials, job)

		_, err = s.BatchInsertSectorFinancials(ctx, financialInputs)
		if err != nil {
			return err
		}

		glog.Info().Msgf(
			"%s | %d | %s | sector financials | count: %d | source-financials: %d",
			job.sector.Name,
			job.year,
			job.period,
			len(financialInputs),
			len(sectorFinancials),
		)
		return nil
	})
	if err != nil {
		return fmt.Errorf("%s | could not sync sector financials: %w", job.sector.Name, err)
	}

	return nil
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
