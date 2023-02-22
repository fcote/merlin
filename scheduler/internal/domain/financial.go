package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type FinancialPeriod string

const (
	FinancialPeriodY   FinancialPeriod = "Y"
	FinancialPeriodQ1  FinancialPeriod = "Q1"
	FinancialPeriodQ2  FinancialPeriod = "Q2"
	FinancialPeriodQ3  FinancialPeriod = "Q3"
	FinancialPeriodQ4  FinancialPeriod = "Q4"
	FinancialPeriodTTM FinancialPeriod = "TTM"
)

func (p FinancialPeriod) String() string {
	return string(p)
}

func (p FinancialPeriod) IsQuarter() bool {
	return p == FinancialPeriodQ1 ||
		p == FinancialPeriodQ2 ||
		p == FinancialPeriodQ3 ||
		p == FinancialPeriodQ4
}

type FinancialYearPeriod struct {
	Year   int
	Period FinancialPeriod
}

type FinancialBase struct {
	Value           float64
	Year            int
	Period          FinancialPeriod
	ReportDate      string
	IsEstimate      bool
	FinancialItemId int
}

type Financial struct {
	FinancialBase
	Id         int
	SecurityId *int
	SectorId   *int
}

func FinancialFromBase(base FinancialBase, securityId *int, sectorId *int) Financial {
	return Financial{
		FinancialBase: base,
		SecurityId:    securityId,
		SectorId:      sectorId,
	}
}

func (f Financial) Hash() string {
	return fmt.Sprintf(
		"%d-%d-%d-%d-%s",
		f.FinancialItemId,
		f.SecurityId,
		f.SectorId,
		f.Year,
		f.Period,
	)
}

func (f Financial) Equal(comp Financial) bool {
	return f.FinancialItemId == comp.FinancialItemId &&
		f.SecurityId == comp.SecurityId &&
		f.SectorId == comp.SectorId &&
		f.Year == comp.Year &&
		f.Period == comp.Period
}

type Financials []Financial

func (financials Financials) Values() []*float64 {
	return slices.Map(financials, func(f Financial) *float64 {
		if math.IsEmpty(f.Value) {
			return nil
		}
		return pointer.To(f.Value)
	})
}

func (financials Financials) Years() []int {
	return slices.Map(financials, func(f Financial) int {
		return f.Year
	})
}

func (financials Financials) Periods() []FinancialPeriod {
	return slices.Map(financials, func(f Financial) FinancialPeriod {
		return f.Period
	})
}

func (financials Financials) ReportDates() []string {
	return slices.Map(financials, func(f Financial) string {
		return f.ReportDate
	})
}

func (financials Financials) IsEstimates() []bool {
	return slices.Map(financials, func(f Financial) bool {
		return f.IsEstimate
	})
}

func (financials Financials) FinancialItemIds() []int {
	return slices.Map(financials, func(f Financial) int {
		return f.FinancialItemId
	})
}

func (financials Financials) SecurityIds() []*int {
	return slices.Map(financials, func(f Financial) *int {
		return f.SecurityId
	})
}

func (financials Financials) SectorIds() []*int {
	return slices.Map(financials, func(f Financial) *int {
		return f.SectorId
	})
}

func (financials Financials) Unique() Financials {
	return slices.Unique(financials)
}

func (financials Financials) IdsFromUniques(uniques Financials, uniqueIds []int) []int {
	ids := make([]int, len(financials))
	for i, financial := range financials {
		pos := slices.FindIndex(uniques, financial)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
