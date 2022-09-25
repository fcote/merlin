package fmp

import (
	"context"
	"math"
	"time"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

func (r Repository) Earnings(ctx context.Context, ticker string) ([]domain.EarningBase, error) {
	earnings, err := r.client.Earnings(ctx, ticker)
	if err != nil {
		return nil, err
	}

	calls, err := r.client.EarningCallList(ctx, ticker)
	if err != nil {
		return nil, err
	}

	result := make([]domain.EarningBase, 0, len(earnings))
	for _, earning := range earnings {
		earningBase := EarningBaseFromFMP(earning, calls)
		if earningBase == nil {
			continue
		}
		result = append(result, *earningBase)
	}

	return result, nil
}

func EarningBaseFromFMP(fmpEarning fmp.Earning, calls []fmp.EarningCall) *domain.EarningBase {
	earningCall := closestEarningCall(fmpEarning, calls)
	if earningCall == nil {
		return nil
	}

	epsSurprisePercent := (fmpEarning.Eps - fmpEarning.EpsEstimated) /
		math.Abs(fmpEarning.EpsEstimated) *
		100
	revenueSurprisePercent := (fmpEarning.Revenue - fmpEarning.RevenueEstimated) /
		math.Abs(fmpEarning.RevenueEstimated) *
		100
	return &domain.EarningBase{
		Date:                   fmpEarning.Date,
		FiscalYear:             earningCall.Year,
		FiscalQuarter:          earningCall.Quarter,
		Time:                   earningTimeFromFMPString(fmpEarning.Time),
		EpsEstimate:            fmpEarning.EpsEstimated,
		Eps:                    fmpEarning.Eps,
		Revenue:                fmpEarning.Revenue / 1e6,
		RevenueEstimate:        fmpEarning.RevenueEstimated / 1e6,
		EpsSurprisePercent:     epsSurprisePercent,
		RevenueSurprisePercent: revenueSurprisePercent,
	}
}

func earningTimeFromFMPString(value string) domain.EarningTime {
	switch value {
	case "bmo":
		return domain.EarningTimeBeforeMarketOpen
	case "amc":
		return domain.EarningTimeAfterMarketClose
	}
	return domain.EarningTimeAfterMarketClose
}

func closestEarningCall(target fmp.Earning, calls []fmp.EarningCall) *fmp.EarningCall {
	var closest fmp.EarningCall
	var closestTime time.Time

	earningTime, err := time.Parse("2006-01-02", target.Date)
	if err != nil {
		return nil
	}

	// Get the closest call
	for _, c := range calls {
		callTime, err := time.Parse("2006-01-02 15:04:05", c.Date)
		if err != nil {
			continue
		}

		diff := earningTime.Sub(callTime).Abs()
		cDiff := earningTime.Sub(closestTime).Abs()
		if diff < cDiff {
			closest = c
			closestTime = callTime
		}
	}

	closestDiff := earningTime.Sub(closestTime)
	if closestDiff.Abs() < 10*24*time.Hour {
		return &closest
	}

	// exact quarters diff
	nDecimalQuarterDiff := float64(closestDiff.Abs()) / float64(90*24*time.Hour)
	// rounded int quarters diff
	nQuarterDiff := time.Duration(math.RoundToEven(nDecimalQuarterDiff))
	// rounded time diff
	nTimeDiff := nQuarterDiff * 90 * 24 * time.Hour
	closestDate := dateFromYearAndQuarter(closest.Year, closest.Quarter)

	var resultDate time.Time
	if closestTime.Unix() < earningTime.Unix() {
		resultDate = closestDate.Add(nTimeDiff)
	} else {
		resultDate = closestDate.Add(-nTimeDiff)
	}

	return &fmp.EarningCall{
		Quarter: resultDate.YearDay()/90 + 1,
		Year:    resultDate.Year(),
	}
}

func dateFromYearAndQuarter(year, quarter int) time.Time {
	return time.Date(
		year,
		time.Month(quarter*3),
		1,
		0,
		0,
		0,
		0,
		time.Local,
	)
}
