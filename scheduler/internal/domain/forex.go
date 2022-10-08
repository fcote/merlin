package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type Forex struct {
	FromCurrency string
	ToCurrency   string
	ExchangeRate float64
}

func (f Forex) Hash() string {
	return fmt.Sprintf(
		"%s-%s",
		f.FromCurrency,
		f.ToCurrency,
	)
}

func (f Forex) Equal(comp Forex) bool {
	return f.FromCurrency == comp.FromCurrency &&
		f.ToCurrency == comp.ToCurrency
}

type Forexes []Forex

func (forexes Forexes) FromCurrencies() []string {
	return slices.Map(forexes, func(f Forex) string {
		return f.FromCurrency
	})
}

func (forexes Forexes) ToCurrencies() []string {
	return slices.Map(forexes, func(f Forex) string {
		return f.ToCurrency
	})
}

func (forexes Forexes) ExchangeRates() []float64 {
	return slices.Map(forexes, func(f Forex) float64 {
		return f.ExchangeRate
	})
}

func (forexes Forexes) Unique() Forexes {
	return slices.Unique(forexes)
}

func (forexes Forexes) IdsFromUniques(uniques Forexes, uniqueIds []int) []int {
	ids := make([]int, len(forexes))
	for i, earning := range forexes {
		pos := slices.FindIndex(uniques, earning)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
