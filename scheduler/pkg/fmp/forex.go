package fmp

import (
	"context"
)

type Forex struct {
	Symbol            string  `json:"symbol"`
	Name              string  `json:"name"`
	Price             float64 `json:"price"`
	ChangesPercentage float64 `json:"changesPercentage"`
	Change            float64 `json:"change"`
	DayLow            float64 `json:"dayLow"`
	DayHigh           float64 `json:"dayHigh"`
	YearHigh          float64 `json:"yearHigh"`
	YearLow           float64 `json:"yearLow"`
	PriceAvg50        float64 `json:"priceAvg50"`
	PriceAvg200       float64 `json:"priceAvg200"`
	Volume            int     `json:"volume"`
	AvgVolume         int     `json:"avgVolume"`
	Exchange          string  `json:"exchange"`
	Open              float64 `json:"open"`
	PreviousClose     float64 `json:"previousClose"`
	Timestamp         int     `json:"timestamp"`
}

func (fmp FMP) Forex(ctx context.Context) ([]Forex, error) {
	url := fmp.url.JoinPath("/v3/quotes/forex")

	var forexes []Forex
	if err := fmp.request(ctx, url, &forexes); err != nil {
		return nil, err
	}
	return forexes, nil
}
