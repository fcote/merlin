package domain

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type EarningTime string

const (
	EarningTimeBeforeMarketOpen EarningTime = "before-market-open"
	EarningTimeAfterMarketClose EarningTime = "after-market-close"
)

func (t EarningTime) String() string {
	return string(t)
}

type EarningStatement struct {
	Speaker   string `json:"speaker"`
	Statement string `json:"statement"`
}

func (s EarningStatement) Value() (driver.Value, error) {
	statementBytes, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return driver.Value(statementBytes), nil
}

type EarningBase struct {
	Date                   string
	FiscalYear             int
	FiscalQuarter          int
	Time                   EarningTime
	EpsEstimate            float64
	Eps                    float64
	Revenue                float64
	RevenueEstimate        float64
	EpsSurprisePercent     float64
	RevenueSurprisePercent float64
	CallTranscript         []EarningStatement
}

type Earning struct {
	EarningBase
	SecurityId int
}

func EarningFromBase(base EarningBase, securityId int) Earning {
	return Earning{
		EarningBase: base,
		SecurityId:  securityId,
	}
}

func (e Earning) Hash() string {
	return fmt.Sprintf(
		"%d-%d-%d",
		e.SecurityId,
		e.FiscalYear,
		e.FiscalQuarter,
	)
}

func (e Earning) Equal(comp Earning) bool {
	return e.SecurityId == comp.SecurityId &&
		e.FiscalYear == comp.FiscalYear &&
		e.FiscalQuarter == comp.FiscalQuarter
}

type Earnings []Earning

func (earnings Earnings) Dates() []string {
	return slices.Map(earnings, func(e Earning) string {
		return e.Date
	})
}

func (earnings Earnings) FiscalYears() []int {
	return slices.Map(earnings, func(e Earning) int {
		return e.FiscalYear
	})
}

func (earnings Earnings) FiscalQuarters() []int {
	return slices.Map(earnings, func(e Earning) int {
		return e.FiscalQuarter
	})
}

func (earnings Earnings) Times() []string {
	return slices.Map(earnings, func(e Earning) string {
		return e.Time.String()
	})
}

func (earnings Earnings) EpsEstimates() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.EpsEstimate) {
			return nil
		}
		return pointer.To(e.EpsEstimate)
	})
}

func (earnings Earnings) Epss() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.Eps) {
			return nil
		}
		return pointer.To(e.Eps)
	})
}

func (earnings Earnings) EpsSurprisePercents() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.EpsSurprisePercent) {
			return nil
		}
		return pointer.To(e.EpsSurprisePercent)
	})
}

func (earnings Earnings) RevenueEstimates() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.RevenueEstimate) {
			return nil
		}
		return pointer.To(e.RevenueEstimate)
	})
}

func (earnings Earnings) Revenues() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.Revenue) {
			return nil
		}
		return pointer.To(e.Revenue)
	})
}

func (earnings Earnings) RevenueSurprisePercents() []*float64 {
	return slices.Map(earnings, func(e Earning) *float64 {
		if math.IsEmpty(e.RevenueSurprisePercent) {
			return nil
		}
		return pointer.To(e.RevenueSurprisePercent)
	})
}

func (earnings Earnings) CallTranscripts() [][]EarningStatement {
	return slices.Map(earnings, func(e Earning) []EarningStatement {
		return e.CallTranscript
	})
}

func (earnings Earnings) SecurityIds() []int {
	return slices.Map(earnings, func(f Earning) int {
		return f.SecurityId
	})
}

func (earnings Earnings) Unique() Earnings {
	return slices.Unique(earnings)
}

func (earnings Earnings) IdsFromUniques(uniques Earnings, uniqueIds []int) []int {
	ids := make([]int, len(earnings))
	for i, earning := range earnings {
		pos := slices.FindIndex(uniques, earning)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
