package fmp

import "context"

type HistoricalPrice struct {
	Date             string  `json:"date"`
	Open             float64 `json:"open"`
	High             float64 `json:"high"`
	Low              float64 `json:"low"`
	Close            float64 `json:"close"`
	AdjClose         float64 `json:"adjClose"`
	Volume           float64 `json:"volume"`
	UnadjustedVolume float64 `json:"unadjustedVolume"`
	Change           float64 `json:"change"`
	ChangePercent    float64 `json:"changePercent"`
	Vwap             float64 `json:"vwap"`
	Label            string  `json:"label"`
	ChangeOverTime   float64 `json:"changeOverTime"`
}

type HistoricalPriceResponse struct {
	Symbol     string            `json:"symbol"`
	Historical []HistoricalPrice `json:"historical"`
}

func (fmp FMP) HistoricalPrices(ctx context.Context, ticker string) ([]HistoricalPrice, error) {
	url := fmp.url.JoinPath("/v3/historical-price-full/", ticker)
	q := url.Query()
	q.Add("from", "1970-01-01")
	url.RawQuery = q.Encode()

	var response HistoricalPriceResponse
	if err := fmp.request(ctx, url, &response); err != nil {
		return nil, err
	}
	return response.Historical, nil
}
