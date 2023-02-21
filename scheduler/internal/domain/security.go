package domain

import (
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

const (
	SecurityTypeCommonStock = "Common Stock"
)

type SecurityBase struct {
	Ticker                     string   `json:"ticker"`
	Currency                   *string  `json:"currency"`
	Type                       string   `json:"type"`
	FiscalYearEndMonth         *int     `json:"fiscalYearEndMonth"`
	MarketStatus               *string  `json:"marketStatus"`
	CurrentPrice               *float64 `json:"currentPrice"`
	DayChange                  *float64 `json:"dayChange"`
	DayChangePercent           *float64 `json:"dayChangePercent"`
	WeekChange                 *float64 `json:"weekChange"`
	WeekChangePercent          *float64 `json:"weekChangePercent"`
	ExtendedHoursPrice         *float64 `json:"extendedHoursPrice"`
	ExtendedHoursChangePercent *float64 `json:"extendedHoursChangePercent"`
	High52Week                 *float64 `json:"high52Week"`
	Low52Week                  *float64 `json:"low52Week"`
	MarketCapitalization       *float64 `json:"marketCapitalization"`
	SharesOutstanding          *float64 `json:"sharesOutstanding"`
}

type Security struct {
	SecurityBase
	Id        int
	CompanyId *int
}

func SecurityFromBase(base SecurityBase, companyId *int) Security {
	return Security{
		SecurityBase: base,
		CompanyId:    companyId,
	}
}

func (s Security) Hash() string {
	return s.Ticker
}

func (s Security) Equal(comp Security) bool {
	return s.Ticker == comp.Ticker
}

type Securities []Security

func (securities Securities) Tickers() []string {
	return slices.Map(securities, func(s Security) string {
		return s.Ticker
	})
}

func (securities Securities) Currencies() []*string {
	return slices.Map(securities, func(s Security) *string {
		return s.Currency
	})
}

func (securities Securities) Types() []string {
	return slices.Map(securities, func(s Security) string {
		return s.Type
	})
}

func (securities Securities) FiscalYearEndMonths() []*int {
	return slices.Map(securities, func(s Security) *int {
		return s.FiscalYearEndMonth
	})
}

func (securities Securities) MarketStatuses() []*string {
	return slices.Map(securities, func(s Security) *string {
		return s.MarketStatus
	})
}

func (securities Securities) CurrentPrices() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.CurrentPrice
	})
}

func (securities Securities) DayChanges() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.DayChange
	})
}

func (securities Securities) DayChangePercents() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.DayChangePercent
	})
}

func (securities Securities) WeekChanges() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.WeekChange
	})
}

func (securities Securities) WeekChangePercents() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.WeekChangePercent
	})
}

func (securities Securities) ExtendedHoursPrices() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.ExtendedHoursPrice
	})
}

func (securities Securities) ExtendedHoursChangePercents() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.ExtendedHoursChangePercent
	})
}

func (securities Securities) High52Weeks() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.High52Week
	})
}

func (securities Securities) Low52Weeks() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.Low52Week
	})
}

func (securities Securities) MarketCapitalizations() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.MarketCapitalization
	})
}

func (securities Securities) SharesOutstandings() []*float64 {
	return slices.Map(securities, func(s Security) *float64 {
		return s.SharesOutstanding
	})
}

func (securities Securities) CompanyIds() []*int {
	return slices.Map(securities, func(s Security) *int {
		return s.CompanyId
	})
}

func (securities Securities) Unique() Securities {
	return slices.Unique(securities)
}

func (securities Securities) IdsFromUniques(uniques Securities, uniqueIds []int) []int {
	ids := make([]int, len(securities))
	for i, security := range securities {
		pos := slices.FindIndex(uniques, security)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
