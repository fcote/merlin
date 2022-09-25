package fmp

import (
	"context"
	"encoding/json"
)

type Earning struct {
	Date             string  `json:"date"`
	Symbol           string  `json:"symbol"`
	Eps              float64 `json:"eps"`
	EpsEstimated     float64 `json:"epsEstimated"`
	Time             string  `json:"time"`
	Revenue          float64 `json:"revenue"`
	RevenueEstimated float64 `json:"revenueEstimated"`
	UpdatedFromDate  string  `json:"updatedFromDate"`
	FiscalDateEnding string  `json:"fiscalDateEnding"`
}

func (fmp FMP) Earnings(ctx context.Context, ticker string) ([]Earning, error) {
	url := fmp.url.JoinPath("/v3/historical/earning_calendar/", ticker)

	var earnings []Earning
	if err := fmp.request(ctx, url, &earnings); err != nil {
		return nil, err
	}
	return earnings, nil
}

type EarningCall struct {
	Quarter int
	Year    int
	Date    string
}

func (c *EarningCall) UnmarshalJSON(b []byte) error {
	a := []interface{}{&c.Quarter, &c.Year, &c.Date}
	return json.Unmarshal(b, &a)
}

func (fmp FMP) EarningCallList(ctx context.Context, ticker string) ([]EarningCall, error) {
	url := fmp.url.JoinPath("/v4/earning_call_transcript")
	q := url.Query()
	q.Add("symbol", ticker)
	url.RawQuery = q.Encode()

	var calls []EarningCall
	if err := fmp.request(ctx, url, &calls); err != nil {
		return nil, err
	}
	return calls, nil
}
