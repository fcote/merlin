package domain

import (
	"fmt"
	"time"

	"github.com/fcote/merlin/sheduler/pkg/math"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type HistoricalPriceBase struct {
	Date          string
	Open          float64
	High          float64
	Low           float64
	Close         float64
	Volume        float64
	Change        float64
	ChangePercent float64
}

type HistoricalPrice struct {
	HistoricalPriceBase
	SecurityId int
}

func HistoricalPriceFromBase(base HistoricalPriceBase, securityId int) HistoricalPrice {
	return HistoricalPrice{
		HistoricalPriceBase: base,
		SecurityId:          securityId,
	}
}

func (h HistoricalPrice) Hash() string {
	return fmt.Sprintf("%d-%s", h.SecurityId, h.Date)
}

func (h HistoricalPrice) Equal(comp HistoricalPrice) bool {
	return h.SecurityId == comp.SecurityId && h.Date == comp.Date
}

type HistoricalPrices []HistoricalPrice

func (prices HistoricalPrices) Dates() []string {
	return slices.Map(prices, func(i HistoricalPrice) string {
		return i.Date
	})
}

func (prices HistoricalPrices) Opens() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.Open) {
			return nil
		}
		return pointer.To(i.Open)
	})
}

func (prices HistoricalPrices) Highs() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.High) {
			return nil
		}
		return pointer.To(i.High)
	})
}

func (prices HistoricalPrices) Lows() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.Low) {
			return nil
		}
		return pointer.To(i.Low)
	})
}

func (prices HistoricalPrices) Closes() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.Close) {
			return nil
		}
		return pointer.To(i.Close)
	})
}

func (prices HistoricalPrices) Volumes() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.Volume) {
			return nil
		}
		return pointer.To(i.Volume)
	})
}

func (prices HistoricalPrices) Changes() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.Change) {
			return nil
		}
		return pointer.To(i.Change)
	})
}

func (prices HistoricalPrices) ChangePercents() []*float64 {
	return slices.Map(prices, func(i HistoricalPrice) *float64 {
		if math.IsEmpty(i.ChangePercent) {
			return nil
		}
		return pointer.To(i.ChangePercent)
	})
}

func (prices HistoricalPrices) SecurityIds() []int {
	return slices.Map(prices, func(i HistoricalPrice) int {
		return i.SecurityId
	})
}

func (prices HistoricalPrices) Unique() HistoricalPrices {
	return slices.Unique(prices)
}

func (prices HistoricalPrices) IdsFromUniques(uniques HistoricalPrices, uniqueIds []int) []int {
	ids := make([]int, len(prices))
	for i, price := range prices {
		pos := slices.FindIndex(uniques, price)
		ids[i] = uniqueIds[pos]
	}
	return ids
}

func (prices HistoricalPrices) MeanPriceForDate(date string) float64 {
	maxTime, _ := time.Parse("2006-01-02", date)
	minTime := maxTime.AddDate(0, 0, -30)

	var monthPrices HistoricalPrices
	for _, price := range prices {
		priceTime, _ := time.Parse("2006-01-02", price.Date)
		if priceTime.After(minTime) && priceTime.Before(maxTime) {
			monthPrices = append(monthPrices, price)
		}
	}

	monthPriceValues := slices.Map(monthPrices, func(p HistoricalPrice) float64 {
		return p.Close
	})
	return math.Mean(monthPriceValues...)
}

func (prices HistoricalPrices) LastPrice() float64 {
	var last HistoricalPrice
	for _, price := range prices {
		if last.Date < price.Date {
			last = price
		}
	}
	return last.Close
}
